import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  to: String,
  subject: String,
  message: String,
  type: { type: String, default: "sent" }, // ✅ NEW
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
