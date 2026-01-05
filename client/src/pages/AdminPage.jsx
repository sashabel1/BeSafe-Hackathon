import { useEffect, useState } from "react";
import { fetchUsers, toggleBlockUser, updateStrikes } from "../services/api";
//import styles from "../styles/AdminPage.module.css"; 

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'blocked', 'strikes'
  const [loading, setLoading] = useState(true);

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
    <div className="admin-container" style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setFilter("all")} disabled={filter === "all"}>
          All Users
        </button>
        <button onClick={() => setFilter("blocked")} disabled={filter === "blocked"}>
          Blocked Users
        </button>
        <button onClick={() => setFilter("strikes")} disabled={filter === "strikes"}>
          Users with Strikes
        </button>
      </div>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
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
            <tr><td colSpan="5">No users found in this category.</td></tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user._id} style={{ backgroundColor: user.isBlocked ? "#ffebee" : "white" }}>
                <td>{user.email}</td>
                <td>{user.nickname || "-"}</td>
                <td>
                  <button onClick={() => handleStrikeChange(user, -1)}>-</button>
                  <span style={{ margin: "0 10px", fontWeight: "bold" }}>{user.strikes}</span>
                  <button onClick={() => handleStrikeChange(user, 1)}>+</button>
                </td>
                <td>
                  {user.isBlocked ? (
                    <span style={{ color: "red", fontWeight: "bold" }}>BLOCKED</span>
                  ) : (
                    <span style={{ color: "green" }}>Active</span>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => handleBlockToggle(user)}
                    style={{ backgroundColor: user.isBlocked ? "green" : "red", color: "white" }}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}