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

  const [selectedEmail, setSelectedEmail] = useState(null);

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
          <p>📥 Inbox</p>
          <p>📤 Sent</p>
          <p>📝 Drafts</p>
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

        {!selectedEmail ? (
          <>
            <h2>📥 Inbox</h2>

            {emails.map((mail) => (
              <div
                key={mail.id}
                onClick={() => setSelectedEmail(mail)}
                style={{
                  border: "1px solid #ddd",
                  padding: 15,
                  marginBottom: 10,
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                <h4>{mail.subject}</h4>
                <p>{mail.content}</p>
                <small>From: {mail.sender}</small>
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={() => setSelectedEmail(null)}>
              ← Back
            </button>

            <h2>{selectedEmail.subject}</h2>
            <p><strong>From:</strong> {selectedEmail.sender}</p>
            <p style={{ marginTop: 20 }}>{selectedEmail.content}</p>
          </>
        )}

      </div>
    </div>
  );
}
