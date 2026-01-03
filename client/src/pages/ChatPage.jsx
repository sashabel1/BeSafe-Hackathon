import { useEffect, useMemo, useState } from "react";
import { toast } from 'react-toastify';
import styles from "../styles/ChatPage.module.css";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function nextId(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function pickFakeReply(text) {
  const t = text.toLowerCase();
  if (t.includes("hi") || t.includes("hey") || t.includes("hello")) return "Hey! 😊";
  if (t.includes("how are you")) return "All good! You?";
  if (t.includes("thanks")) return "Sure!";
  const replies = ["Nice 😄", "Tell me more", "Ok 👍", "Haha 😂", "Got it"];
  return replies[Math.floor(Math.random() * replies.length)];
}

export default function ChatPage() {
  const MY_REAL_ID ="6957d9bf79cd5b94625a9d8d";
  // TODO: להחליף ל-auth אמיתי
  const me = useMemo(() => ({ id:MY_REAL_ID , name: "Me (Demo)" }), []);

  const API_BASE = useMemo(
    () => (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, ""),
    []
  );

  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);

  // conversations: key=userId, value=array of messages
  const [conversations, setConversations] = useState({});

  const [input, setInput] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // New state to handle the loading state while the AI checks the message
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        if (!API_BASE) {
          throw new Error("Missing VITE_SERVER_API_URL in .env");
        }

        setLoadingUsers(true);
        setUsersError(null);

        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);

        const dbUsers = await res.json();

        // Filter out current user so you don't chat with yourself
        const mapped = dbUsers
          .filter(u => u._id !== MY_REAL_ID)
          .map((u) => ({
            id: u._id,
            name: u.nickname || u.email || "User",
            status: "online",
          }));

        if (cancelled) return;

        setUsers(mapped);
        setActiveUserId((prev) => prev ?? mapped[0]?.id ?? null);
      } catch (e) {
        if (cancelled) return;
        setUsersError(e.message || "Failed to load users");
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
}

    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) || null,
    [users, activeUserId]
  );

  const activeMessages = conversations[activeUserId] ?? [];

  const lastMessagePreview = (userId) => {
    const msgs = conversations[userId] ?? [];
    if (msgs.length === 0) return "No messages yet";
    const last = msgs[msgs.length - 1];
    return `${last.sender === "me" ? "You: " : ""}${last.text}`;
  };


  // NEW: Send message handler with AI validation
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeUserId || isChecking) return;

    // 1. Lock the interface
    setIsChecking(true);

    try {
      // 2. Validate message with the server
      const response = await fetch(`${API_BASE}/ai/validate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: me.id, 
          text: text 
        })
      });

      const data = await response.json();

      // 3. Handle blocked content
      if (!data.allowed) {
        toast.error(data.reason || "Message blocked due to harmful content.");

        if (data.isBlocked) {
            setTimeout(() => {
                alert("Your account has been blocked due to repeated violations.");
                window.location.href = '/';  // TODO: Redirect to home or login page  + logout the user
            }, 2000);
        }
        return; // Stop here, do not send the message
      }

      // Optional: Warn user if they received a strike
      if (data.strikes > 0) {
         toast.warning(`Warning: You have ${data.strikes} strikes.`);
      }
      // 4. If allowed, proceed with sending (Client-side logic)
      const myMsg = { id: nextId(), sender: "me", text, ts: Date.now() };

      setConversations((prev) => ({
        ...prev,
        [activeUserId]: [...(prev[activeUserId] ?? []), myMsg],
      }));

      setInput("");
      // Fake reply simulation
      const replyText = pickFakeReply(text);
      window.setTimeout(() => {
        const theirMsg = { id: nextId(), sender: "them", text: replyText, ts: Date.now() };
        setConversations((prev) => ({
          ...prev,
          [activeUserId]: [...(prev[activeUserId] ?? []), theirMsg],
        }));
      }, 1000);

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Server connection error");
    } finally {
      // 5. Release the lock
      setIsChecking(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.chatsTitle}>Chats</div>
          <div className={styles.loggedInAs}>Logged in as: {me.name}</div>
        </div>

        <div className={styles.userList}>
          {loadingUsers ? (
            <div style={{ padding: 12 }}>Loading users...</div>
          ) : usersError ? (
            <div style={{ padding: 12, color: "crimson" }}>{usersError}</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 12 }}>No users found</div>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveUserId(u.id)}
                className={`${styles.userItem} ${u.id === activeUserId ? styles.userItemActive : ""}`}
              >
                <div className={styles.userRow}>
                  <div className={styles.avatar}>{u.name.split(" ").slice(-1)[0]}</div>

                  <div className={styles.userMeta}>
                    <div className={styles.userName}>
                      {u.name}{" "}
                      <span
                        className={styles.statusDot}
                        style={{ background: u.status === "online" ? "#2ecc71" : "#95a5a6" }}
                      />
                    </div>

                    <div className={styles.preview}>{lastMessagePreview(u.id)}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <section className={styles.chat}>
        <header className={styles.chatHeader}>
          <div className={styles.activeUserName}>{activeUser ? activeUser.name : "Chat"}</div>
          <div className={styles.activeUserStatus}>
            {activeUser?.status === "online" ? "Online" : "Offline"}
          </div>
        </header>

        <div className={styles.messages}>
          {activeMessages.length === 0 ? (
            <div className={styles.emptyState}>No messages yet. Say hi 👋</div>
          ) : (
            activeMessages.map((m) => (
              <div
                key={m.id}
                className={styles.msgRow}
                style={{ justifyContent: m.sender === "me" ? "flex-end" : "flex-start" }}
              >
                <div className={`${styles.bubble} ${m.sender === "me" ? styles.bubbleMe : styles.bubbleThem}`}>
                  <div>{m.text}</div>
                  <div className={styles.time}>{formatTime(m.ts)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className={styles.inputBar}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isChecking ? "Sending..." : `Message ${activeUser?.name ?? ""}`}
            disabled={!activeUserId || isChecking}
            style={{ opacity: isChecking ? 0.7 : 1 }}
          />
          <button className={styles.sendBtn} onClick={sendMessage} disabled={!activeUserId || isChecking}
            style={{ 
                opacity: isChecking ? 0.7 : 1, 
                cursor: isChecking ? 'wait' : 'pointer' 
            }}>
            {isChecking ? "..." : "Send"}
          </button>
        </footer>
      </section>
    </div>
  );
}

