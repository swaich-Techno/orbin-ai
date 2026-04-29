import mongoose from "mongoose";
import connectDB, { hasDatabase } from "./mongodb";
import Message from "../models/Message";
import { buildSampleMessages, buildSnippet } from "./sampleMessages";

const MAILBOXES = ["inbox", "sent", "drafts", "archive", "trash"];

function getMemoryStore() {
  if (!global.orbinMailStore) {
    global.orbinMailStore = buildSampleMessages();
  }

  return global.orbinMailStore;
}

function normalizeLabels(labels) {
  if (Array.isArray(labels)) {
    return labels
      .map((label) => String(label).trim())
      .filter(Boolean);
  }

  if (typeof labels === "string") {
    return labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
  }

  return [];
}

function asBoolean(value) {
  if (value === true || value === false) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function normalizeMessage(message) {
  if (!message) {
    return null;
  }

  const raw = typeof message.toObject === "function" ? message.toObject() : message;
  const mailbox = raw.mailbox || raw.type || "inbox";
  const body = raw.body || raw.message || "";
  const createdAt = raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt).toISOString() : createdAt;

  return {
    _id: raw._id ? String(raw._id) : String(new mongoose.Types.ObjectId()),
    from: raw.from || "",
    fromName: raw.fromName || raw.from || "Unknown sender",
    to: raw.to || "",
    cc: raw.cc || "",
    bcc: raw.bcc || "",
    subject: raw.subject || "(No subject)",
    body,
    message: body,
    snippet: raw.snippet || buildSnippet(body),
    mailbox,
    type: mailbox,
    labels: normalizeLabels(raw.labels),
    category: raw.category || "general",
    isRead: Boolean(raw.isRead),
    isStarred: Boolean(raw.isStarred),
    isImportant: Boolean(raw.isImportant),
    deliveryStatus:
      raw.deliveryStatus ||
      (mailbox === "drafts" ? "draft" : mailbox === "sent" ? "sent" : "received"),
    createdAt,
    updatedAt
  };
}

function sanitizePayload(payload = {}) {
  const action = payload.action === "draft" ? "draft" : "send";
  const mailbox = MAILBOXES.includes(payload.mailbox)
    ? payload.mailbox
    : action === "draft"
      ? "drafts"
      : "sent";
  const body = String(payload.body || payload.message || "").trim();

  return {
    from: String(payload.from || "me@orbin.ai").trim() || "me@orbin.ai",
    fromName: String(payload.fromName || "Orbin Workspace").trim() || "Orbin Workspace",
    to: String(payload.to || "").trim(),
    cc: String(payload.cc || "").trim(),
    bcc: String(payload.bcc || "").trim(),
    subject: String(payload.subject || "").trim() || "(No subject)",
    body,
    message: body,
    snippet: buildSnippet(body),
    mailbox,
    type: mailbox,
    labels: normalizeLabels(payload.labels),
    category: String(payload.category || "general").trim() || "general",
    isRead: mailbox !== "inbox",
    isStarred: Boolean(payload.isStarred),
    isImportant: Boolean(payload.isImportant),
    deliveryStatus: action === "draft" ? "draft" : "sent"
  };
}

function matchesFilters(message, filters = {}) {
  const q = String(filters.q || "").trim().toLowerCase();
  const label = String(filters.label || "").trim().toLowerCase();

  if (filters.mailbox && message.mailbox !== filters.mailbox) {
    return false;
  }

  if (filters.category && filters.category !== "all" && message.category !== filters.category) {
    return false;
  }

  if (asBoolean(filters.starred) === true && !message.isStarred) {
    return false;
  }

  if (asBoolean(filters.unread) === true && message.isRead) {
    return false;
  }

  if (label && !message.labels.some((item) => item.toLowerCase().includes(label))) {
    return false;
  }

  if (!q) {
    return true;
  }

  const haystack = [
    message.subject,
    message.body,
    message.from,
    message.fromName,
    message.to,
    message.snippet
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function sortMessages(messages, sort = "newest") {
  const nextMessages = [...messages];

  nextMessages.sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();

    if (sort === "oldest") {
      return leftTime - rightTime;
    }

    if (sort === "unread") {
      if (left.isRead !== right.isRead) {
        return left.isRead ? 1 : -1;
      }
    }

    return rightTime - leftTime;
  });

  return nextMessages;
}

async function seedDatabaseIfNeeded() {
  await connectDB();
  const count = await Message.countDocuments();

  if (count === 0) {
    await Message.insertMany(buildSampleMessages({ includeIds: false }));
  }
}

function buildMongoQuery(filters = {}) {
  const query = {};
  const unread = asBoolean(filters.unread);
  const starred = asBoolean(filters.starred);
  const label = String(filters.label || "").trim();
  const q = String(filters.q || "").trim();

  if (filters.mailbox) {
    query.mailbox = filters.mailbox;
  }

  if (filters.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (unread === true) {
    query.isRead = false;
  }

  if (starred === true) {
    query.isStarred = true;
  }

  if (label) {
    query.labels = { $regex: label, $options: "i" };
  }

  if (q) {
    query.$or = [
      { subject: { $regex: q, $options: "i" } },
      { body: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
      { from: { $regex: q, $options: "i" } },
      { fromName: { $regex: q, $options: "i" } },
      { to: { $regex: q, $options: "i" } }
    ];
  }

  return query;
}

export async function listMessages(filters = {}) {
  if (hasDatabase()) {
    await seedDatabaseIfNeeded();
    const query = buildMongoQuery(filters);
    const messages = await Message.find(query).lean();
    return sortMessages(messages.map(normalizeMessage), filters.sort);
  }

  const messages = getMemoryStore()
    .map(normalizeMessage)
    .filter((message) => matchesFilters(message, filters));

  return sortMessages(messages, filters.sort);
}

export async function getMessageById(id) {
  if (hasDatabase()) {
    await seedDatabaseIfNeeded();
    const message = await Message.findById(id).lean();
    return normalizeMessage(message);
  }

  const message = getMemoryStore().find((item) => item._id === id);
  return normalizeMessage(message);
}

export async function createMessage(payload = {}) {
  const sanitized = sanitizePayload(payload);

  if (hasDatabase()) {
    await connectDB();
    const created = await Message.create(sanitized);
    return normalizeMessage(created);
  }

  const now = new Date().toISOString();
  const message = normalizeMessage({
    _id: String(new mongoose.Types.ObjectId()),
    ...sanitized,
    createdAt: now,
    updatedAt: now
  });

  getMemoryStore().unshift(message);
  return message;
}

export async function updateMessage(id, changes = {}) {
  const allowedChanges = {};

  if (typeof changes.mailbox === "string" && MAILBOXES.includes(changes.mailbox)) {
    allowedChanges.mailbox = changes.mailbox;
    allowedChanges.type = changes.mailbox;
  }

  if (typeof changes.category === "string" && changes.category.trim()) {
    allowedChanges.category = changes.category.trim();
  }

  if (changes.labels !== undefined) {
    allowedChanges.labels = normalizeLabels(changes.labels);
  }

  const maybeRead = asBoolean(changes.isRead);
  const maybeStarred = asBoolean(changes.isStarred);
  const maybeImportant = asBoolean(changes.isImportant);

  if (maybeRead !== undefined) {
    allowedChanges.isRead = maybeRead;
  }

  if (maybeStarred !== undefined) {
    allowedChanges.isStarred = maybeStarred;
  }

  if (maybeImportant !== undefined) {
    allowedChanges.isImportant = maybeImportant;
  }

  if (hasDatabase()) {
    await connectDB();
    const updated = await Message.findByIdAndUpdate(
      id,
      { ...allowedChanges, updatedAt: new Date() },
      { new: true }
    ).lean();

    return normalizeMessage(updated);
  }

  const store = getMemoryStore();
  const index = store.findIndex((message) => message._id === id);

  if (index === -1) {
    return null;
  }

  const currentMessage = normalizeMessage(store[index]);
  const nextMessage = normalizeMessage({
    ...currentMessage,
    ...allowedChanges,
    updatedAt: new Date().toISOString()
  });

  store[index] = nextMessage;
  return nextMessage;
}

export async function getMailboxSummary() {
  const messages = hasDatabase()
    ? await listMessages()
    : getMemoryStore().map(normalizeMessage);

  const counts = {
    inbox: 0,
    sent: 0,
    drafts: 0,
    archive: 0,
    trash: 0,
    unread: 0,
    starred: 0,
    important: 0
  };

  for (const message of messages) {
    if (counts[message.mailbox] !== undefined) {
      counts[message.mailbox] += 1;
    }

    if (!message.isRead) {
      counts.unread += 1;
    }

    if (message.isStarred) {
      counts.starred += 1;
    }

    if (message.isImportant) {
      counts.important += 1;
    }
  }

  return {
    storageMode: hasDatabase() ? "mongodb" : "memory",
    counts
  };
}
