function createSnippet(body) {
  return body.replace(/\s+/g, " ").trim().slice(0, 140);
}

function hoursAgo(value) {
  const date = new Date();
  date.setHours(date.getHours() - value);
  return date.toISOString();
}

function daysAgo(value, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() - value);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const starterMessages = [
  {
    from: "nina@northstarvc.com",
    fromName: "Nina Patel",
    to: "founders@orbin.ai",
    subject: "Updated diligence notes and next questions",
    body: `Team,\n\nWe reviewed the product walkthrough and left a few diligence notes.\n\n1. Customer onboarding looks strong.\n2. We want clarity on enterprise security controls.\n3. Please share your Q3 pipeline assumptions.\n\nIf helpful, I can jump on a 20 minute call tomorrow.\n\nNina`,
    mailbox: "inbox",
    category: "finance",
    labels: ["Investors", "Priority"],
    isRead: false,
    isStarred: true,
    isImportant: true,
    deliveryStatus: "received",
    createdAt: hoursAgo(2)
  },
  {
    from: "alerts@acmebank.io",
    fromName: "AcmeBank Alerts",
    to: "ops@orbin.ai",
    subject: "Invoice #4481 failed to sync into the ledger",
    body: `Heads up,\n\nThe nightly sync skipped invoice #4481 because the tax code was missing.\n\nPlease review the record before 4 PM so finance reports stay accurate.`,
    mailbox: "inbox",
    category: "operations",
    labels: ["Finance", "Ops"],
    isRead: false,
    isStarred: false,
    isImportant: true,
    deliveryStatus: "received",
    createdAt: hoursAgo(5)
  },
  {
    from: "marco@lumenlabs.dev",
    fromName: "Marco Ruiz",
    to: "support@orbin.ai",
    subject: "Can your team route VIP customer mail automatically?",
    body: `Hi Orbin,\n\nWe are testing your platform for shared inbox workflows. We need VIP customer mail to land in a dedicated queue with auto labels.\n\nIs that possible in the current version?\n\nThanks,\nMarco`,
    mailbox: "inbox",
    category: "customers",
    labels: ["Customers", "AI"],
    isRead: true,
    isStarred: true,
    isImportant: false,
    deliveryStatus: "received",
    createdAt: daysAgo(1, 14)
  },
  {
    from: "jobs@brightworks.design",
    fromName: "Brightworks Design",
    to: "people@orbin.ai",
    subject: "Candidate portfolio for product designer role",
    body: `Hello,\n\nSharing a final portfolio for the designer shortlist. The candidate has strong dashboard experience and a good systems mindset.\n\nLet us know if you want us to schedule interviews next week.`,
    mailbox: "inbox",
    category: "people",
    labels: ["Hiring"],
    isRead: true,
    isStarred: false,
    isImportant: false,
    deliveryStatus: "received",
    createdAt: daysAgo(2, 11)
  },
  {
    from: "me@orbin.ai",
    fromName: "Orbin Workspace",
    to: "marco@lumenlabs.dev",
    subject: "Re: Can your team route VIP customer mail automatically?",
    body: `Hi Marco,\n\nYes, we can support that workflow in the current prototype with label-based routing, priority flags, and shared team ownership.\n\nI am recording a short demo for you this afternoon.\n\nBest,\nOrbin`,
    mailbox: "sent",
    category: "customers",
    labels: ["Customers"],
    isRead: true,
    isStarred: false,
    isImportant: false,
    deliveryStatus: "sent",
    createdAt: daysAgo(1, 16)
  },
  {
    from: "me@orbin.ai",
    fromName: "Orbin Workspace",
    to: "leadership@orbin.ai",
    subject: "Draft: Q3 launch messaging for shared inbox",
    body: `Working draft\n\nTheme: email command center for modern teams.\n\nNeed tighter copy around security, automation, and migration from Gmail or Outlook.`,
    mailbox: "drafts",
    category: "marketing",
    labels: ["Launch"],
    isRead: true,
    isStarred: false,
    isImportant: true,
    deliveryStatus: "draft",
    createdAt: daysAgo(3, 10)
  },
  {
    from: "digest@openbuild.ai",
    fromName: "OpenBuild Digest",
    to: "research@orbin.ai",
    subject: "Weekly AI tooling roundup",
    body: `This week:\n\n- Better retrieval benchmarks\n- New inbox triage agents\n- Faster PDF parsing stacks\n\nArchived for the research team.`,
    mailbox: "archive",
    category: "research",
    labels: ["AI", "Reading"],
    isRead: true,
    isStarred: false,
    isImportant: false,
    deliveryStatus: "received",
    createdAt: daysAgo(4, 9)
  },
  {
    from: "newsletter@randomstore.com",
    fromName: "Random Store",
    to: "hello@orbin.ai",
    subject: "Flash sale you did not ask for",
    body: `This one was moved to trash because it is low value promotional noise.`,
    mailbox: "trash",
    category: "promotions",
    labels: ["Low Signal"],
    isRead: true,
    isStarred: false,
    isImportant: false,
    deliveryStatus: "received",
    createdAt: daysAgo(6, 8)
  }
];

export function buildSampleMessages({ includeIds = true } = {}) {
  return starterMessages.map((message, index) => {
    const body = message.body.trim();
    const createdAt = message.createdAt || new Date().toISOString();

    return {
      ...(includeIds ? { _id: `seed-${index + 1}` } : {}),
      ...message,
      body,
      message: body,
      snippet: createSnippet(body),
      createdAt,
      updatedAt: createdAt
    };
  });
}

export function buildSnippet(body) {
  return createSnippet(body);
}
