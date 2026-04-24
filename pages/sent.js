import { useState, useEffect } from "react";

export default function Sent() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    fetch("/api/get?type=sent")
      .then(res => res.json())
      .then(data => setEmails(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Sent Mail</h2>

      {emails.length === 0 ? (
        <p>No sent messages yet.</p>
      ) : (
        emails.map((mail) => (
          <div key={mail._id} style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
            borderRadius: 6
          }}>
            <h4>{mail.subject}</h4>
            <p>{mail.message}</p>
            <small>To: {mail.to}</small>
          </div>
        ))
      )}
    </div>
  );
}
