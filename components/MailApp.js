import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../styles/MailApp.module.css";

const MAILBOXES = [
  { key: "inbox", label: "Inbox", hint: "New customer and team mail" },
  { key: "sent", label: "Sent", hint: "Messages your team has delivered" },
  { key: "drafts", label: "Drafts", hint: "Ideas waiting for polish" },
  { key: "archive", label: "Archive", hint: "Keep it, hide it, find it later" },
  { key: "trash", label: "Trash", hint: "Low-value mail removed from focus" }
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "customers", label: "Customers" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "people", label: "People" },
  { value: "research", label: "Research" },
  { value: "promotions", label: "Promotions" },
  { value: "general", label: "General" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "unread", label: "Unread first" }
];

const LABEL_PRESETS = [
  "Priority",
  "Investors",
  "Customers",
  "AI",
  "Ops",
  "Finance",
  "Launch",
  "Hiring"
];

function createEmptyCompose() {
  return {
    to: "",
    cc: "",
    subject: "",
    body: "",
    category: "customers",
    labels: ""
  };
}

function formatTimestamp(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 1000 * 60 * 60 * 24;

  if (diff < oneDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (diff < oneDay * 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(message) {
  const source = message?.fromName || message?.from || "Mail";
  return source
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatLabels(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value || "";
}

export default function MailApp({
  initialMailbox = "inbox",
  initialComposeOpen = false
}) {
  const [mailbox, setMailbox] = useState(initialMailbox);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [labelFilter, setLabelFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [composeOpen, setComposeOpen] = useState(initialComposeOpen);
  const [composeData, setComposeData] = useState(createEmptyCompose());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMailbox(initialMailbox);
  }, [initialMailbox]);

  useEffect(() => {
    if (initialComposeOpen) {
      setComposeOpen(true);
    }
  }, [initialComposeOpen]);

  useEffect(() => {
    loadMessages();
  }, [mailbox, search, category, labelFilter, sort, unreadOnly, starredOnly]);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (!messages.length) {
      setSelectedId(null);
      return;
    }

    const hasSelection = messages.some((message) => message._id === selectedId);

    if (!hasSelection) {
      setSelectedId(messages[0]._id);
    }
  }, [messages, selectedId]);

  async function loadMessages() {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      mailbox,
      category,
      sort
    });

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (labelFilter.trim()) {
      params.set("label", labelFilter.trim());
    }

    if (unreadOnly) {
      params.set("unread", "true");
    }

    if (starredOnly) {
      params.set("starred", "true");
    }

    try {
      const response = await fetch(`/api/messages?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load mailbox");
      }

      setMessages(data.messages || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load mailbox");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const response = await fetch("/api/mailboxes");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load mailbox summary");
      }

      setSummary(data);
    } catch (loadError) {
      setError(loadError.message || "Unable to load mailbox summary");
    }
  }

  async function patchMessage(id, changes, successMessage = "") {
    setError("");

    const response = await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(changes)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to update message");
    }

    if (successMessage) {
      setBanner(successMessage);
    }

    await loadMessages();
    await loadSummary();
    return data.message;
  }

  async function handleSelectMessage(message) {
    setSelectedId(message._id);

    if (message.isRead || message.mailbox !== "inbox") {
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item._id === message._id ? { ...item, isRead: true } : item
      )
    );

    try {
      await fetch(`/api/messages/${message._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isRead: true })
      });
      await loadSummary();
    } catch {
      // Silent background update to keep list navigation fast.
    }
  }

  function openFreshCompose() {
    setComposeData(createEmptyCompose());
    setComposeOpen(true);
    setBanner("");
    setError("");
  }

  function openReplyComposer(message) {
    const subject = message.subject.startsWith("Re:")
      ? message.subject
      : `Re: ${message.subject}`;

    setComposeData({
      to: message.from,
      cc: "",
      subject,
      body: `\n\n--- Original message ---\n${message.body}`,
      category: message.category || "customers",
      labels: formatLabels(message.labels)
    });
    setComposeOpen(true);
    setBanner("");
    setError("");
  }

  async function handleComposeSubmit(action) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...composeData,
          action
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save message");
      }

      const targetMailbox = action === "draft" ? "drafts" : "sent";

      setComposeOpen(false);
      setComposeData(createEmptyCompose());
      setSelectedId(data.message?._id || null);
      setBanner(action === "draft" ? "Draft saved." : "Message moved into Sent.");

      if (mailbox === targetMailbox) {
        await loadMessages();
      } else {
        setMailbox(targetMailbox);
      }

      await loadSummary();
    } catch (submitError) {
      setError(submitError.message || "Unable to save message");
    } finally {
      setSaving(false);
    }
  }

  const selectedMessage =
    messages.find((message) => message._id === selectedId) || null;

  const labelOptions = Array.from(
    new Set([
      ...LABEL_PRESETS,
      ...messages.flatMap((message) => message.labels || [])
    ])
  );

  return (
    <div className={styles.shell}>
      <div className={styles.auroraLeft} />
      <div className={styles.auroraRight} />

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.brandBlock}>
            <div className={styles.brandMark}>O</div>
            <div>
              <p className={styles.eyebrow}>Orbin Mail OS</p>
              <h1 className={styles.brandTitle}>Inbox command center</h1>
            </div>
          </div>

          <p className={styles.sidebarCopy}>
            A shared workspace for triage, sorting, drafting, and follow-up.
          </p>

          <button className={styles.composeButton} onClick={openFreshCompose}>
            Compose message
          </button>

          <nav className={styles.mailboxList}>
            {MAILBOXES.map((item) => {
              const count = summary?.counts?.[item.key] || 0;
              const isActive = mailbox === item.key;

              return (
                <button
                  key={item.key}
                  className={`${styles.mailboxButton} ${
                    isActive ? styles.mailboxButtonActive : ""
                  }`}
                  onClick={() => setMailbox(item.key)}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.hint}</small>
                  </span>
                  <span className={styles.mailboxCount}>{count}</span>
                </button>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.storageBadge}>
              {summary?.storageMode === "mongodb"
                ? "MongoDB live storage"
                : "Demo memory mode"}
            </div>

            <div className={styles.quickStats}>
              <div>
                <span>Unread</span>
                <strong>{summary?.counts?.unread || 0}</strong>
              </div>
              <div>
                <span>Starred</span>
                <strong>{summary?.counts?.starred || 0}</strong>
              </div>
              <div>
                <span>Important</span>
                <strong>{summary?.counts?.important || 0}</strong>
              </div>
            </div>

            <div className={styles.routeLinks}>
              <Link href="/">Dashboard</Link>
              <Link href="/sent">Sent</Link>
              <Link href="/compose">Compose</Link>
            </div>
          </div>
        </aside>

        <main className={styles.workspace}>
          <section className={styles.topbar}>
            <div>
              <p className={styles.eyebrow}>Shared team mail</p>
              <h2 className={styles.workspaceTitle}>
                Build your own Gmail or Outlook-style workflow
              </h2>
            </div>

            <div className={styles.searchWrap}>
              <input
                className={styles.searchInput}
                placeholder="Search sender, subject, labels, or message text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </section>

          {banner ? <div className={styles.notice}>{banner}</div> : null}
          {error ? <div className={styles.error}>{error}</div> : null}

          {summary?.storageMode === "memory" ? (
            <div className={styles.warning}>
              MongoDB is optional, but without `MONGODB_URI` this runs in demo
              memory mode and new messages will not persist after a restart.
            </div>
          ) : null}

          <section className={styles.summaryGrid}>
            <article className={`${styles.summaryCard} ${styles.summarySun}`}>
              <span>Inbox</span>
              <strong>{summary?.counts?.inbox || 0}</strong>
              <p>Messages waiting for a response</p>
            </article>
            <article className={`${styles.summaryCard} ${styles.summaryLagoon}`}>
              <span>Unread</span>
              <strong>{summary?.counts?.unread || 0}</strong>
              <p>Items that still need eyes on them</p>
            </article>
            <article className={`${styles.summaryCard} ${styles.summaryMint}`}>
              <span>Starred</span>
              <strong>{summary?.counts?.starred || 0}</strong>
              <p>High-value conversations worth tracking</p>
            </article>
            <article className={`${styles.summaryCard} ${styles.summaryRose}`}>
              <span>Drafts</span>
              <strong>{summary?.counts?.drafts || 0}</strong>
              <p>Messages being refined before delivery</p>
            </article>
          </section>

          <section className={styles.workGrid}>
            <div className={styles.listPane}>
              <div className={styles.paneHeader}>
                <div>
                  <p className={styles.eyebrow}>Mailbox</p>
                  <h3>{MAILBOXES.find((item) => item.key === mailbox)?.label}</h3>
                </div>

                <button className={styles.ghostButton} onClick={openFreshCompose}>
                  New draft
                </button>
              </div>

              <div className={styles.filters}>
                <label className={styles.togglePill}>
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={() => setUnreadOnly((value) => !value)}
                  />
                  Unread only
                </label>

                <label className={styles.togglePill}>
                  <input
                    type="checkbox"
                    checked={starredOnly}
                    onChange={() => setStarredOnly((value) => !value)}
                  />
                  Starred only
                </label>

                <select
                  className={styles.select}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.select}
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  className={styles.labelInput}
                  list="orbin-labels"
                  placeholder="Filter by label"
                  value={labelFilter}
                  onChange={(event) => setLabelFilter(event.target.value)}
                />
                <datalist id="orbin-labels">
                  {labelOptions.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              </div>

              <div className={styles.messageList}>
                {loading ? (
                  <div className={styles.emptyState}>Loading mailbox...</div>
                ) : null}

                {!loading && !messages.length ? (
                  <div className={styles.emptyState}>
                    No messages matched these filters.
                  </div>
                ) : null}

                {!loading
                  ? messages.map((message) => {
                      const isActive = selectedId === message._id;
                      const unreadClass = !message.isRead
                        ? styles.messageCardUnread
                        : "";

                      return (
                        <article
                          key={message._id}
                          className={`${styles.messageCard} ${unreadClass} ${
                            isActive ? styles.messageCardActive : ""
                          }`}
                          onClick={() => handleSelectMessage(message)}
                        >
                          <div className={styles.messageTop}>
                            <div>
                              <p className={styles.messageSender}>
                                {message.fromName || message.from}
                              </p>
                              <h4>{message.subject}</h4>
                            </div>

                            <div className={styles.messageRight}>
                              <button
                                className={styles.starButton}
                                onClick={async (event) => {
                                  event.stopPropagation();
                                  try {
                                    await patchMessage(
                                      message._id,
                                      { isStarred: !message.isStarred },
                                      message.isStarred
                                        ? "Removed from starred."
                                        : "Added to starred."
                                    );
                                  } catch (patchError) {
                                    setError(
                                      patchError.message || "Unable to update starred state"
                                    );
                                  }
                                }}
                              >
                                {message.isStarred ? "Starred" : "Star"}
                              </button>
                              <span>{formatTimestamp(message.createdAt)}</span>
                            </div>
                          </div>

                          <p className={styles.snippet}>{message.snippet}</p>

                          <div className={styles.badges}>
                            <span className={styles.categoryBadge}>
                              {message.category}
                            </span>
                            {message.isImportant ? (
                              <span className={styles.importanceBadge}>
                                Important
                              </span>
                            ) : null}
                            {(message.labels || []).slice(0, 2).map((label) => (
                              <span key={label} className={styles.labelBadge}>
                                {label}
                              </span>
                            ))}
                          </div>
                        </article>
                      );
                    })
                  : null}
              </div>
            </div>

            <div className={styles.detailPane}>
              {!selectedMessage ? (
                <div className={styles.detailEmpty}>
                  Select a message to review the full conversation.
                </div>
              ) : (
                <div className={styles.detailScroll}>
                  <div className={styles.paneHeader}>
                    <div>
                      <p className={styles.eyebrow}>Conversation</p>
                      <h3>{selectedMessage.subject}</h3>
                    </div>

                    <div className={styles.headerActions}>
                      <button
                        className={styles.ghostButton}
                        onClick={() => openReplyComposer(selectedMessage)}
                      >
                        Reply
                      </button>
                      <button
                        className={styles.ghostButton}
                        onClick={async () => {
                          try {
                            await patchMessage(
                              selectedMessage._id,
                              { mailbox: "archive" },
                              "Moved to archive."
                            );
                          } catch (patchError) {
                            setError(
                              patchError.message || "Unable to archive message"
                            );
                          }
                        }}
                      >
                        Archive
                      </button>
                      <button
                        className={styles.ghostButton}
                        onClick={async () => {
                          try {
                            await patchMessage(
                              selectedMessage._id,
                              { mailbox: "trash" },
                              "Moved to trash."
                            );
                          } catch (patchError) {
                            setError(
                              patchError.message || "Unable to move message to trash"
                            );
                          }
                        }}
                      >
                        Trash
                      </button>
                    </div>
                  </div>

                  <div className={styles.messageHero}>
                    <div className={styles.avatar}>{getInitials(selectedMessage)}</div>
                    <div className={styles.messageHeroCopy}>
                      <p className={styles.messageSender}>
                        {selectedMessage.fromName || selectedMessage.from}
                      </p>
                      <span>
                        {selectedMessage.from} to {selectedMessage.to || "your team"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailMeta}>
                    <div>
                      <span>Mailbox</span>
                      <strong>{selectedMessage.mailbox}</strong>
                    </div>
                    <div>
                      <span>Received</span>
                      <strong>
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span>Category</span>
                      <strong>{selectedMessage.category}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{selectedMessage.deliveryStatus}</strong>
                    </div>
                  </div>

                  <div className={styles.badges}>
                    {(selectedMessage.labels || []).map((label) => (
                      <span key={label} className={styles.labelBadge}>
                        {label}
                      </span>
                    ))}
                    {selectedMessage.isStarred ? (
                      <span className={styles.importanceBadge}>Starred</span>
                    ) : null}
                    {!selectedMessage.isRead ? (
                      <span className={styles.importanceBadge}>Unread</span>
                    ) : null}
                  </div>

                  <div className={styles.detailActions}>
                    <button
                      className={styles.secondaryButton}
                      onClick={async () => {
                        try {
                          await patchMessage(
                            selectedMessage._id,
                            { isRead: !selectedMessage.isRead },
                            selectedMessage.isRead
                              ? "Marked as unread."
                              : "Marked as read."
                          );
                        } catch (patchError) {
                          setError(
                            patchError.message || "Unable to update read state"
                          );
                        }
                      }}
                    >
                      {selectedMessage.isRead ? "Mark unread" : "Mark read"}
                    </button>

                    <button
                      className={styles.secondaryButton}
                      onClick={async () => {
                        try {
                          await patchMessage(
                            selectedMessage._id,
                            { isStarred: !selectedMessage.isStarred },
                            selectedMessage.isStarred
                              ? "Removed from starred."
                              : "Added to starred."
                          );
                        } catch (patchError) {
                          setError(
                            patchError.message || "Unable to update starred state"
                          );
                        }
                      }}
                    >
                      {selectedMessage.isStarred ? "Remove star" : "Add star"}
                    </button>

                    <button
                      className={styles.secondaryButton}
                      onClick={async () => {
                        try {
                          await patchMessage(
                            selectedMessage._id,
                            {
                              mailbox:
                                selectedMessage.mailbox === "archive"
                                  ? "inbox"
                                  : "archive"
                            },
                            selectedMessage.mailbox === "archive"
                              ? "Restored to inbox."
                              : "Moved to archive."
                          );
                        } catch (patchError) {
                          setError(
                            patchError.message || "Unable to update mailbox"
                          );
                        }
                      }}
                    >
                      {selectedMessage.mailbox === "archive"
                        ? "Restore inbox"
                        : "Archive thread"}
                    </button>
                  </div>

                  <article className={styles.messageBody}>
                    {selectedMessage.body}
                  </article>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {composeOpen ? (
        <div className={styles.composeOverlay}>
          <div className={styles.composeCard}>
            <div className={styles.composeHeader}>
              <div>
                <p className={styles.eyebrow}>Compose</p>
                <h3>Create a message</h3>
              </div>

              <button
                className={styles.ghostButton}
                onClick={() => setComposeOpen(false)}
              >
                Close
              </button>
            </div>

            <div className={styles.composeGrid}>
              <label className={styles.field}>
                <span>To</span>
                <input
                  value={composeData.to}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      to: event.target.value
                    }))
                  }
                  placeholder="customer@company.com"
                />
              </label>

              <label className={styles.field}>
                <span>CC</span>
                <input
                  value={composeData.cc}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      cc: event.target.value
                    }))
                  }
                  placeholder="optional@company.com"
                />
              </label>

              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span>Subject</span>
                <input
                  value={composeData.subject}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      subject: event.target.value
                    }))
                  }
                  placeholder="What is this message about?"
                />
              </label>

              <label className={styles.field}>
                <span>Category</span>
                <select
                  value={composeData.category}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      category: event.target.value
                    }))
                  }
                >
                  {CATEGORY_OPTIONS.filter((option) => option.value !== "all").map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className={styles.field}>
                <span>Labels</span>
                <input
                  list="compose-labels"
                  value={composeData.labels}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      labels: event.target.value
                    }))
                  }
                  placeholder="Priority, Customers, Launch"
                />
                <datalist id="compose-labels">
                  {labelOptions.map((label) => (
                    <option key={label} value={label} />
                  ))}
                </datalist>
              </label>

              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span>Message</span>
                <textarea
                  className={styles.textarea}
                  value={composeData.body}
                  onChange={(event) =>
                    setComposeData((current) => ({
                      ...current,
                      body: event.target.value
                    }))
                  }
                  placeholder="Write the full message here..."
                />
              </label>
            </div>

            <div className={styles.composeActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => handleComposeSubmit("draft")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button
                className={styles.composeButton}
                onClick={() => handleComposeSubmit("send")}
                disabled={saving}
              >
                {saving ? "Sending..." : "Send message"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
