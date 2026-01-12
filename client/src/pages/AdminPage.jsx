import { useEffect, useState } from "react";
import { fetchUsers, toggleBlockUser, updateStrikes } from "../services/api";
import "../styles/AdminPage.css";
import AdminMessages from "../components/adminMessagesComponent";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'blocked', 'strikes'
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("users"); // 'users' | 'messages'

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // function to toggle block status of a user
  const handleBlockToggle = async (user) => {
    try {
      const newStatus = !user.isBlocked;
      const { data: updatedUser } = await toggleBlockUser(user._id, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updatedUser : u)));
    } catch (error) {
      console.error("Error updating block status:", error);
    }
  };

  // function to change strikes of a user
  const handleStrikeChange = async (user, change) => {
    const newStrikes = user.strikes + change;
    if (newStrikes < 0) return;

    try {
      const { data: updatedUser } = await updateStrikes(user._id, newStrikes);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? updatedUser : u)));
    } catch (error) {
      console.error("Error updating strikes:", error);
    }
  };

  // filter users based on selected filter
  const filteredUsers = users.filter((user) => {
    if (filter === "blocked") return user.isBlocked;
    if (filter === "strikes") return user.strikes > 0;
    return true; // "all"
  });

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="filter-bar">
      <button
        className="filter-btn"
        onClick={() => {
          setView("users");
          setFilter("all");
        }}
        disabled={view === "users"}
      >
        All Users
      </button>

      <button
        className="filter-btn"
        onClick={() => {
          setView("users");
          setFilter("blocked");
        }}
        disabled={view === "users" && filter === "blocked"}
      >
        Blocked Users
      </button>

      <button
        className="filter-btn"
        onClick={() => {
          setView("users");
          setFilter("strikes");
        }}
        disabled={view === "users" && filter === "strikes"}
      >
        Users with Strikes
      </button>

      {/* 🆕 הכפתור החדש */}
      <button
        className="filter-btn"
        onClick={() => setView("messages")}
        disabled={view === "messages"}
      >
        Admin Messages
      </button>
    </div>

    {view === "users" && (
      <table className="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nickname</th>
            <th>Strikes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No users found.
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr
                key={user._id}
                className={`user-row ${user.isBlocked ? "blocked" : ""}`}
              >
                <td>{user.email}</td>
                <td>{user.nickname || "-"}</td>
                <td>
                  <button
                    className="strike-btn"
                    onClick={() => handleStrikeChange(user, -1)}
                  >
                    -
                  </button>
                  <span className="strike-count">{user.strikes}</span>
                  <button
                    className="strike-btn"
                    onClick={() => handleStrikeChange(user, 1)}
                  >
                    +
                  </button>
                </td>
                <td>
                  <span
                    className={`status-tag ${
                      user.isBlocked ? "status-blocked" : "status-active"
                    }`}
                  >
                    {user.isBlocked ? "BLOCKED" : "Active"}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleBlockToggle(user)}
                    className={`action-btn ${
                      user.isBlocked ? "btn-unblock" : "btn-block"
                    }`}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
  )}
  {view === "messages" && <AdminMessages />}
  </div>
  );
}