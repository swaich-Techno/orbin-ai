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
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px"
      }}>
        <h2>🚀 Orbin</h2>

        <div style={{ marginTop: 30 }}>
          <p style={{ cursor: "pointer" }}>📥 Inbox</p>
          <p style={{ cursor: "pointer" }}>📤 Sent</p>
          <p style={{ cursor: "pointer" }}>📝 Drafts</p>
        </div>

        <button style={{
          marginTop: 20,
          padding: 10,
          width: "100%",
          background: "#4CAF50",
          color: "#fff",
          border: "none"
        }}>
          + Compose
        </button>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, padding: 20 }}>

        {/* Top Bar */}
        <div style={{
          borderBottom: "1px solid #ddd",
          paddingBottom: 10,
          marginBottom: 20
        }}>
          <h2>📥 Inbox</h2>
        </div>

        {/* Email List */}
        {emails.map((mail) => (
          <div key={mail.id} style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
            borderRadius: 6
          }}>
            <h4>{mail.subject}</h4>
            <p>{mail.content}</p>
            <small>From: {mail.sender}</small>
          </div>
        ))}

      </div>
    </div>
  );
}
