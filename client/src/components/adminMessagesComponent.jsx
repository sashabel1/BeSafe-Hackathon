import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const data = await apiGet("/api/admin-messages");
      setMessages(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load admin messages");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>User</th>
          <th>Email</th>
          <th>Title</th>
          <th>Message</th>
        </tr>
      </thead>

      <tbody>
        {messages.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              No messages found.
            </td>
          </tr>
        ) : (
          messages.map((msg) => (
            <tr key={msg._id}>
              <td>{new Date(msg.createdAt).toLocaleString()}</td>
              <td>{msg.senderId?.nickname || "-"}</td>
              <td>{msg.senderId?.email || "-"}</td>
              <td>{msg.title}</td>
              <td>{msg.text}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
