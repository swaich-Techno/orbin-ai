import connectDB from "../../lib/mongodb";
import Message from "../../models/Message";

export default async function handler(req, res) {
  await connectDB();

  const msg = await Message.create(req.body);

  res.json(msg);
}
