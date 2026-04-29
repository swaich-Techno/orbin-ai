import { listMessages } from "../../lib/messageStore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const type = req.query?.type;
    const messages = await listMessages({
      mailbox: type || req.query?.mailbox,
      q: req.query?.q,
      unread: req.query?.unread,
      starred: req.query?.starred,
      category: req.query?.category,
      label: req.query?.label,
      sort: req.query?.sort
    });

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to load messages" });
  }
}
