import { useState } from "react";

export default function Inbox() {
  const [emails] = useState([
    {
      id: 1,
      subject: "Client Approval Needed",
      content: "Please review the proposal and approve.",
      sender: "client@company.com"
    },
    {
      id: 2,
      subject: "Meeting Tomorrow",
      content: "Reminder: meeting at 10 AM.",
      sender: "team@work.com"
    }
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📥 Orbin Inbox</h2>

      {emails.map((mail) => (
        <div key={mail.id} style={{
          border: "1px solid #ddd",
          padding: 10,
          marginTop: 10
        }}>
          <h4>{mail.subject}</h4>
          <p>{mail.content}</p>
          <small>From: {mail.sender}</small>
        </div>
      ))}
    </div>
  );
}
