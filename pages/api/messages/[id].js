import { getMessageById, updateMessage } from "../../../lib/messageStore";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const message = await getMessageById(id);

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      return res.status(200).json({ message });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Unable to load message" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const message = await updateMessage(id, req.body || {});

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      return res.status(200).json({ message });
    } catch (error) {
      return res.status(500).json({ error: error.message || "Unable to update message" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
