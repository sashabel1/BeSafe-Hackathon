// import { useEffect, useMemo, useState } from "react";
// import { toast } from 'react-toastify';
// import styles from "../styles/ChatPage.module.css";

// function formatTime(ts) {
//   const d = new Date(ts);
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

// function nextId(prefix = "m") {
//   return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
// }

// function pickFakeReply(text) {
//   const t = text.toLowerCase();
//   if (t.includes("hi") || t.includes("hey") || t.includes("hello")) return "Hey! 😊";
//   if (t.includes("how are you")) return "All good! You?";
//   if (t.includes("thanks")) return "Sure!";
//   const replies = ["Nice 😄", "Tell me more", "Ok 👍", "Haha 😂", "Got it"];
//   return replies[Math.floor(Math.random() * replies.length)];
// }

// export default function ChatPage() {
//   const MY_REAL_ID ="6957d9bf79cd5b94625a9d8d";
//   // TODO: להחליף ל-auth אמיתי
//   const me = useMemo(() => ({ id:MY_REAL_ID , name: "Me (Demo)" }), []);

//   const API_BASE = useMemo(
//     () => (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, ""),
//     []
//   );

//   const [users, setUsers] = useState([]);
//   const [activeUserId, setActiveUserId] = useState(null);

//   // conversations: key=userId, value=array of messages
//   const [conversations, setConversations] = useState({});

//   const [input, setInput] = useState("");

//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState(null);

//   // New state to handle the loading state while the AI checks the message
//   const [isChecking, setIsChecking] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadUsers() {
//       try {
//         if (!API_BASE) {
//           throw new Error("Missing VITE_SERVER_API_URL in .env");
//         }

//         setLoadingUsers(true);
//         setUsersError(null);

//         const res = await fetch(`${API_BASE}/users`);
//         if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);

//         const dbUsers = await res.json();

//         // Filter out current user so you don't chat with yourself
//         const mapped = dbUsers
//           .filter(u => u._id !== MY_REAL_ID)
//           .map((u) => ({
//             id: u._id,
//             name: u.nickname || u.email || "User",
//             status: "online",
//           }));

//         if (cancelled) return;

//         setUsers(mapped);
//         setActiveUserId((prev) => prev ?? mapped[0]?.id ?? null);
//       } catch (e) {
//         if (cancelled) return;
//         setUsersError(e.message || "Failed to load users");
//       } finally {
//         if (!cancelled) {
//           setLoadingUsers(false);
//         }
// }

//     }

//     loadUsers();

//     return () => {
//       cancelled = true;
//     };
//   }, [API_BASE]);

//   const activeUser = useMemo(
//     () => users.find((u) => u.id === activeUserId) || null,
//     [users, activeUserId]
//   );

//   const activeMessages = conversations[activeUserId] ?? [];

//   const lastMessagePreview = (userId) => {
//     const msgs = conversations[userId] ?? [];
//     if (msgs.length === 0) return "No messages yet";
//     const last = msgs[msgs.length - 1];
//     return `${last.sender === "me" ? "You: " : ""}${last.text}`;
//   };


//   // NEW: Send message handler with AI validation
//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || !activeUserId || isChecking) return;

//     // 1. Lock the interface
//     setIsChecking(true);

//     try {
//       // 2. Validate message with the server
//       const response = await fetch(`${API_BASE}/validate-message`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           userId: me.id, 
//           text: text 
//         })
//       });

//       const data = await response.json();

//       // 3. Handle blocked content
//       if (!data.allowed) {
//         toast.error(data.reason || "Message blocked due to harmful content.");

//         if (data.isBlocked) {
//             setTimeout(() => {
//                 alert("Your account has been blocked due to repeated violations.");
//                 window.location.href = '/';  // TODO: Redirect to home or login page  + logout the user
//             }, 2000);
//         }
//         return; // Stop here, do not send the message
//       }

//       // Optional: Warn user if they received a strike
//       if (data.strikes > 0) {
//          toast.warning(`Warning: You have ${data.strikes} strikes.`);
//       }
//       // 4. If allowed, proceed with sending (Client-side logic)
//       const myMsg = { id: nextId(), sender: "me", text, ts: Date.now() };

//       setConversations((prev) => ({
//         ...prev,
//         [activeUserId]: [...(prev[activeUserId] ?? []), myMsg],
//       }));

//       setInput("");
//       // Fake reply simulation
//       const replyText = pickFakeReply(text);
//       window.setTimeout(() => {
//         const theirMsg = { id: nextId(), sender: "them", text: replyText, ts: Date.now() };
//         setConversations((prev) => ({
//           ...prev,
//           [activeUserId]: [...(prev[activeUserId] ?? []), theirMsg],
//         }));
//       }, 1000);

//     } catch (error) {
//       console.error("Error sending message:", error);
//       toast.error("Server connection error");
//     } finally {
//       // 5. Release the lock
//       setIsChecking(false);
//     }
//   };

//   const onKeyDown = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   return (
//     <div className={styles.page}>
//       {/* Sidebar */}
//       <aside className={styles.sidebar}>
//         <div className={styles.sidebarHeader}>
//           <div className={styles.chatsTitle}>Chats</div>
//           <div className={styles.loggedInAs}>Logged in as: {me.name}</div>
//         </div>

//         <div className={styles.userList}>
//           {loadingUsers ? (
//             <div style={{ padding: 12 }}>Loading users...</div>
//           ) : usersError ? (
//             <div style={{ padding: 12, color: "crimson" }}>{usersError}</div>
//           ) : users.length === 0 ? (
//             <div style={{ padding: 12 }}>No users found</div>
//           ) : (
//             users.map((u) => (
//               <button
//                 key={u.id}
//                 onClick={() => setActiveUserId(u.id)}
//                 className={`${styles.userItem} ${u.id === activeUserId ? styles.userItemActive : ""}`}
//               >
//                 <div className={styles.userRow}>
//                   <div className={styles.avatar}>{u.name.split(" ").slice(-1)[0]}</div>

//                   <div className={styles.userMeta}>
//                     <div className={styles.userName}>
//                       {u.name}{" "}
//                       <span
//                         className={styles.statusDot}
//                         style={{ background: u.status === "online" ? "#2ecc71" : "#95a5a6" }}
//                       />
//                     </div>

//                     <div className={styles.preview}>{lastMessagePreview(u.id)}</div>
//                   </div>
//                 </div>
//               </button>
//             ))
//           )}
//         </div>
//       </aside>

//       {/* Chat area */}
//       <section className={styles.chat}>
//         <header className={styles.chatHeader}>
//           <div className={styles.activeUserName}>{activeUser ? activeUser.name : "Chat"}</div>
//           <div className={styles.activeUserStatus}>
//             {activeUser?.status === "online" ? "Online" : "Offline"}
//           </div>
//         </header>

//         <div className={styles.messages}>
//           {activeMessages.length === 0 ? (
//             <div className={styles.emptyState}>No messages yet. Say hi 👋</div>
//           ) : (
//             activeMessages.map((m) => (
//               <div
//                 key={m.id}
//                 className={styles.msgRow}
//                 style={{ justifyContent: m.sender === "me" ? "flex-end" : "flex-start" }}
//               >
//                 <div className={`${styles.bubble} ${m.sender === "me" ? styles.bubbleMe : styles.bubbleThem}`}>
//                   <div>{m.text}</div>
//                   <div className={styles.time}>{formatTime(m.ts)}</div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         <footer className={styles.inputBar}>
//           <input
//             className={styles.input}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={onKeyDown}
//             placeholder={isChecking ? "Sending..." : `Message ${activeUser?.name ?? ""}`}
//             disabled={!activeUserId || isChecking}
//             style={{ opacity: isChecking ? 0.7 : 1 }}
//           />
//           <button className={styles.sendBtn} onClick={sendMessage} disabled={!activeUserId || isChecking}
//             style={{ 
//                 opacity: isChecking ? 0.7 : 1, 
//                 cursor: isChecking ? 'wait' : 'pointer' 
//             }}>
//             {isChecking ? "..." : "Send"}
//           </button>
//         </footer>
//       </section>
//     </div>
//   );
// }

import { useEffect, useMemo, useState,useRef } from "react";
import { toast } from "react-toastify";
import styles from "../styles/ChatPage.module.css";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function safeName(u) {
  return u?.nickname || u?.email || u?.name || "User";
}

export default function ChatPage() {
  const MY_REAL_ID = "69544a18df4dbe449b9094b1"; // TODO: להחליף ל-auth אמיתי
  const me = useMemo(() => ({ id: MY_REAL_ID, name: "Me (Demo)" }), []);
  const previousStrikesRef = useRef(0); // Ref to track previous strikes

  const API_BASE = useMemo(
    () => (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, ""),
    []
  );

  // Users (רק כדי ליצור צ'אט אישי חדש)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Conversations list מהשרת
  const [conversationList, setConversationList] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [conversationsError, setConversationsError] = useState(null);

  // Active conversation
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Messages cache by conversationId
  const [messagesByConversation, setMessagesByConversation] = useState({});

  // Input + validation lock
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // "Start new chat" UI (מינימלי)
  const [showNewChat, setShowNewChat] = useState(false);

  // ---------- Load Users ----------
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        if (!API_BASE) throw new Error("Missing VITE_SERVER_API_URL in .env");

        setLoadingUsers(true);
        setUsersError(null);

        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);

        const dbUsers = await res.json();

        const mapped = dbUsers
          .filter((u) => String(u._id) !== String(MY_REAL_ID))
          .map((u) => ({
            id: u._id,
            nickname: u.nickname,
            email: u.email,
            name: safeName(u),
            status: "online",
          }));

        if (cancelled) return;
        setUsers(mapped);
      } catch (e) {
        if (cancelled) return;
        setUsersError(e.message || "Failed to load users");
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  // ---------- Load Conversations ----------
  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      try {
        if (!API_BASE) throw new Error("Missing VITE_SERVER_API_URL in .env");

        setLoadingConversations(true);
        setConversationsError(null);

        const res = await fetch(`${API_BASE}/conversations?userId=${me.id}`);
        if (!res.ok) throw new Error(`Failed to load conversations: ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        setConversationList(data);
        setActiveConversationId((prev) => prev ?? data[0]?._id ?? null);
      } catch (e) {
        if (cancelled) return;
        setConversationsError(e.message || "Failed to load conversations");
      } finally {
        if (!cancelled) setLoadingConversations(false);
      }
    }

    loadConversations();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, me.id]);

  // ---------- Load Messages for active conversation (cached) ----------
  useEffect(() => {
    let cancelled = false;

    async function loadMessages(conversationId) {
      // cache
      if (messagesByConversation[conversationId]) return;

      const res = await fetch(
        `${API_BASE}/conversations/${conversationId}/messages?userId=${me.id}`
      );
      if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);

      const data = await res.json();
      if (cancelled) return;

      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: data }));
    }

    if (API_BASE && me.id && activeConversationId) {
      loadMessages(activeConversationId).catch((err) => {
        console.error(err);
        toast.error("Failed to load messages");
      });
    }

    return () => {
      cancelled = true;
    };
  }, [API_BASE, me.id, activeConversationId, messagesByConversation]);

  const activeConversation = useMemo(
    () => conversationList.find((c) => String(c._id) === String(activeConversationId)) || null,
    [conversationList, activeConversationId]
  );

  const activeMessages = messagesByConversation[activeConversationId] ?? [];

  // ---------- Helpers for sidebar title ----------
  const getOtherUserIdForPersonal = (convo) => {
    if (!convo || convo.type !== "personal") return null;
    const ids = (convo.participants || []).map(String);
    const other = ids.find((id) => id !== String(me.id));
    return other || null;
  };

  const conversationTitle = (convo) => {
    if (!convo) return "Chat";
    if (convo.type === "group") return convo.topic || "Group";

    // personal
    const otherId = getOtherUserIdForPersonal(convo);
    const otherUser = users.find((u) => String(u.id) === String(otherId));
    return otherUser ? otherUser.name : "Personal chat";
  };

  const conversationPreview = (convo) => {
    const text = convo?.lastMessageText || "";
    return text ? text : "No messages yet";
  };

  // ---------- Open/Create personal chat ----------
  async function openPersonalChat(otherUserId) {
    try {
      const res = await fetch(`${API_BASE}/conversations/personal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: me.id, otherUserId }),
      });

      const convo = await res.json();

      if (!res.ok) {
        toast.error(convo?.error || "Failed to open chat");
        return;
      }

      // add if not exists
      setConversationList((prev) => {
        const exists = prev.some((c) => String(c._id) === String(convo._id));
        return exists ? prev : [convo, ...prev];
      });

      setActiveConversationId(convo._id);
      setShowNewChat(false);
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    }
  }

  // ---------- Send Message ----------
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeConversationId || isChecking) return;

    setIsChecking(true);
    try {
      const vRes = await fetch(`${API_BASE}/validate-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: me.id, text }),
      });

      const vData = await vRes.json().catch(() => ({}));

      if (!vRes.ok) {
        toast.error(vData?.error || "Validation failed");
        return;
      }

      if (vData && vData.allowed === false) {
        toast.error(vData.reason || "Message blocked due to harmful content.");
        
        if (typeof vData?.strikes === "number") {
             previousStrikesRef.current = vData.strikes;
        }

        setInput(""); 

        if (vData.isBlocked) {
          setTimeout(() => {
            alert("Your account has been blocked due to repeated violations.");
            window.location.href = "/";
          }, 2000);
        }
        return; 
      }

      if (typeof vData?.strikes === "number" && vData.strikes > 0) {
         if (vData.strikes > previousStrikesRef.current) {
            toast.warning(`Warning: You have ${vData.strikes} strikes.`);
         }
         previousStrikesRef.current = vData.strikes;
      }

      // 2) send message to conversation
      const res = await fetch(`${API_BASE}/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: me.id, text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Failed to send message");
        return;
      }


      // 3) update messages cache
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] ?? []), data],
      }));

      // 4) update conversation preview (local)
      setConversationList((prev) => {
        const updated = prev.map((c) =>
          String(c._id) === String(activeConversationId)
            ? {
                ...c,
                lastMessageText: text,
                lastMessageAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        );

        // move active to top (UI feels better)
        const active = updated.find((c) => String(c._id) === String(activeConversationId));
        const rest = updated.filter((c) => String(c._id) !== String(activeConversationId));
        return active ? [active, ...rest] : updated;
      });

      setInput("");
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
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
          <div className={styles.chatsTitle} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span>Chats</span>
            <button
              className={styles.sendBtn}
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={() => setShowNewChat((s) => !s)}
            >
              {showNewChat ? "Close" : "New"}
            </button>
          </div>
          <div className={styles.loggedInAs}>Logged in as: {me.name}</div>
        </div>

        {/* New Chat panel (simple) */}
        {showNewChat && (
          <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Start a personal chat:</div>
            {loadingUsers ? (
              <div style={{ padding: 6 }}>Loading users...</div>
            ) : usersError ? (
              <div style={{ padding: 6, color: "crimson" }}>{usersError}</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 6 }}>No users found</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto" }}>
                {users.map((u) => (
                  <button
                    key={u.id}
                    className={styles.userItem}
                    onClick={() => openPersonalChat(u.id)}
                    style={{ textAlign: "left" }}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.userList}>
          {loadingConversations ? (
            <div style={{ padding: 12 }}>Loading chats...</div>
          ) : conversationsError ? (
            <div style={{ padding: 12, color: "crimson" }}>{conversationsError}</div>
          ) : conversationList.length === 0 ? (
            <div style={{ padding: 12 }}>No conversations yet. Click “New” to start.</div>
          ) : (
            conversationList.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveConversationId(c._id)}
                className={`${styles.userItem} ${
                  String(c._id) === String(activeConversationId) ? styles.userItemActive : ""
                }`}
              >
                <div className={styles.userRow}>
                  <div className={styles.avatar}>{conversationTitle(c).slice(0, 1)}</div>

                  <div className={styles.userMeta}>
                    <div className={styles.userName}>
                      {conversationTitle(c)}{" "}
                      <span
                        className={styles.statusDot}
                        style={{ background: "#2ecc71" }}
                        title={c.type}
                      />
                    </div>

                    <div className={styles.preview}>{conversationPreview(c)}</div>
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
          <div className={styles.activeUserName}>
            {activeConversation ? conversationTitle(activeConversation) : "Chat"}
          </div>
          <div className={styles.activeUserStatus}>
            {activeConversation ? (activeConversation.type === "group" ? "Group" : "Personal") : ""}
          </div>
        </header>

        <div className={styles.messages}>
          {!activeConversationId ? (
            <div className={styles.emptyState}>Select a chat to start</div>
          ) : activeMessages.length === 0 ? (
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
            placeholder={
              isChecking
                ? "Sending..."
                : activeConversation
                ? `Message ${conversationTitle(activeConversation)}`
                : "Select a chat..."
            }
            disabled={!activeConversationId || isChecking}
            style={{ opacity: isChecking ? 0.7 : 1 }}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!activeConversationId || isChecking}
            style={{
              opacity: isChecking ? 0.7 : 1,
              cursor: isChecking ? "wait" : "pointer",
            }}
          >
            {isChecking ? "..." : "Send"}
          </button>
        </footer>
      </section>
    </div>
  );
}
