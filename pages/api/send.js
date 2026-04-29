import { createMessage } from "../../lib/messageStore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const message = await createMessage({
      ...req.body,
      action: req.body?.type === "drafts" ? "draft" : "send",
      mailbox: req.body?.type || req.body?.mailbox
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to save message" });
  }
}
