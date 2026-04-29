import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: String,
    fromName: String,
    to: String,
    cc: String,
    bcc: String,
    subject: String,
    body: String,
    message: String,
    snippet: String,
    mailbox: { type: String, default: "inbox" },
    type: { type: String, default: "inbox" },
    category: { type: String, default: "general" },
    labels: { type: [String], default: [] },
    isRead: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    deliveryStatus: { type: String, default: "received" }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
