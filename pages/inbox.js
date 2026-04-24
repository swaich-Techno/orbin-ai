import { useState, useEffect } from "react";

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetch("/api/get")
      .then(res => res.json())
      .then(data => setEmails(data));
  }, []);

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

        <a href="/compose">
          <button style={{
            marginTop: 20,
            padding: 10,
            width: "100%",
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}>
            + Compose
          </button>
        </a>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, padding: 20 }}>

        {!selectedEmail ? (
          <>
            <h2>📥 Inbox</h2>

            {emails.map((mail) => (
              <div
                key={mail._id}
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
                <p>{mail.message}</p>
                <small>To: {mail.to}</small>
              </div>
            ))}
          </>
        ) : (
          <>
            <button onClick={() => setSelectedEmail(null)}>
              ← Back
            </button>

            <h2>{selectedEmail.subject}</h2>
            <p><strong>To:</strong> {selectedEmail.to}</p>
            <p style={{ marginTop: 20 }}>{selectedEmail.message}</p>
          </>
        )}

      </div>
    </div>
  );
}
