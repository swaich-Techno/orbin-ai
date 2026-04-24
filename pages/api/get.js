import connectDB from "../../lib/mongodb";
import Message from "../../models/Message";

export default async function handler(req, res) {
  await connectDB();

  const { type } = req.query;

  const messages = await Message.find(
    type ? { type } : {}
  ).sort({ createdAt: -1 });

  res.json(messages);
}
