import { createMessage, listMessages } from "../../../lib/messageStore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const messages = await listMessages({
        mailbox: req.query?.mailbox,
        q: req.query?.q,
        unread: req.query?.unread,
        starred: req.query?.starred,
        category: req.query?.category,
        label: req.query?.label,
        sort: req.query?.sort
      });

      return res.status(200).json({ messages });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Unable to load messages" });
    }
  }

  if (req.method === "POST") {
    try {
      const message = await createMessage(req.body);
      return res.status(201).json({ message });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Unable to create message" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
