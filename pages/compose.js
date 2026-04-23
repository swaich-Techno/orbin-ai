import { useState } from "react";

export default function Compose() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Message sent (demo)");

    setForm({ to: "", subject: "", message: "" });
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>✉️ Compose Message</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        
        <input
          placeholder="To"
          value={form.to}
          onChange={(e) => setForm({ ...form, to: e.target.value })}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ width: "100%", height: 150, padding: 10 }}
        />

        <button
          type="submit"
          style={{
            marginTop: 15,
            padding: 10,
            background: "#4CAF50",
            color: "#fff",
            border: "none"
          }}
        >
          Send
        </button>

      </form>
    </div>
  );
}
