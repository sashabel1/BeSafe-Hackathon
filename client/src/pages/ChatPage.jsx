// import { useEffect, useMemo, useState,useRef } from "react";
// import { toast } from "react-toastify";
// import styles from "../styles/ChatPage.module.css";

// function formatTime(ts) {
//   const d = new Date(ts);
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

// function safeName(u) {
//   return u?.nickname || u?.email || u?.name || "User";
// }

// export default function ChatPage() {
//   const MY_REAL_ID = "69544a18df4dbe449b9094b1"; // TODO: להחליף ל-auth אמיתי
//   const me = useMemo(() => ({ id: MY_REAL_ID, name: "Me (Demo)" }), []);
//   const previousStrikesRef = useRef(0); // Ref to track previous strikes

//   const API_BASE = useMemo(
//     () => (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, ""),
//     []
//   );

//   // Users (רק כדי ליצור צ'אט אישי חדש)
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState(null);

//   // Conversations list מהשרת
//   const [conversationList, setConversationList] = useState([]);
//   const [loadingConversations, setLoadingConversations] = useState(true);
//   const [conversationsError, setConversationsError] = useState(null);

//   // Active conversation
//   const [activeConversationId, setActiveConversationId] = useState(null);

//   // Messages cache by conversationId
//   const [messagesByConversation, setMessagesByConversation] = useState({});

//   // Input + validation lock
//   const [input, setInput] = useState("");
//   const [isChecking, setIsChecking] = useState(false);

//   // "Start new chat" UI (מינימלי)
//   const [showNewChat, setShowNewChat] = useState(false);

//   // ---------- Load Users ----------
//   useEffect(() => {
//     let cancelled = false;

//     async function loadUsers() {
//       try {
//         if (!API_BASE) throw new Error("Missing VITE_SERVER_API_URL in .env");

//         setLoadingUsers(true);
//         setUsersError(null);

//         const res = await fetch(`${API_BASE}/users`);
//         if (!res.ok) throw new Error(`Failed to load users: ${res.status}`);

//         const dbUsers = await res.json();

//         const mapped = dbUsers
//           .filter((u) => String(u._id) !== String(MY_REAL_ID))
//           .map((u) => ({
//             id: u._id,
//             nickname: u.nickname,
//             email: u.email,
//             name: safeName(u),
//             status: "online",
//           }));

//         if (cancelled) return;
//         setUsers(mapped);
//       } catch (e) {
//         if (cancelled) return;
//         setUsersError(e.message || "Failed to load users");
//       } finally {
//         if (!cancelled) setLoadingUsers(false);
//       }
//     }

//     loadUsers();
//     return () => {
//       cancelled = true;
//     };
//   }, [API_BASE]);

//   // ---------- Load Conversations ----------
//   useEffect(() => {
//     let cancelled = false;

//     async function loadConversations() {
//       try {
//         if (!API_BASE) throw new Error("Missing VITE_SERVER_API_URL in .env");

//         setLoadingConversations(true);
//         setConversationsError(null);

//         const res = await fetch(`${API_BASE}/conversations?userId=${me.id}`);
//         if (!res.ok) throw new Error(`Failed to load conversations: ${res.status}`);

//         const data = await res.json();
//         if (cancelled) return;

//         setConversationList(data);
//         setActiveConversationId((prev) => prev ?? data[0]?._id ?? null);
//       } catch (e) {
//         if (cancelled) return;
//         setConversationsError(e.message || "Failed to load conversations");
//       } finally {
//         if (!cancelled) setLoadingConversations(false);
//       }
//     }

//     loadConversations();
//     return () => {
//       cancelled = true;
//     };
//   }, [API_BASE, me.id]);

//   // ---------- Load Messages for active conversation (cached) ----------
//   useEffect(() => {
//     let cancelled = false;

//     async function loadMessages(conversationId) {
//       // cache
//       if (messagesByConversation[conversationId]) return;

//       const res = await fetch(
//         `${API_BASE}/conversations/${conversationId}/messages?userId=${me.id}`
//       );
//       if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);

//       const data = await res.json();
//       if (cancelled) return;

//       setMessagesByConversation((prev) => ({ ...prev, [conversationId]: data }));
//     }

//     if (API_BASE && me.id && activeConversationId) {
//       loadMessages(activeConversationId).catch((err) => {
//         console.error(err);
//         toast.error("Failed to load messages");
//       });
//     }

//     return () => {
//       cancelled = true;
//     };
//   }, [API_BASE, me.id, activeConversationId, messagesByConversation]);

//   const activeConversation = useMemo(
//     () => conversationList.find((c) => String(c._id) === String(activeConversationId)) || null,
//     [conversationList, activeConversationId]
//   );

//   const activeMessages = messagesByConversation[activeConversationId] ?? [];

//   // ---------- Helpers for sidebar title ----------
//   const getOtherUserIdForPersonal = (convo) => {
//     if (!convo || convo.type !== "personal") return null;
//     const ids = (convo.participants || []).map(String);
//     const other = ids.find((id) => id !== String(me.id));
//     return other || null;
//   };

//   const conversationTitle = (convo) => {
//     if (!convo) return "Chat";
//     if (convo.type === "group") return convo.topic || "Group";

//     // personal
//     const otherId = getOtherUserIdForPersonal(convo);
//     const otherUser = users.find((u) => String(u.id) === String(otherId));
//     return otherUser ? otherUser.name : "Personal chat";
//   };

//   const conversationPreview = (convo) => {
//     const text = convo?.lastMessageText || "";
//     return text ? text : "No messages yet";
//   };

//   // ---------- Open/Create personal chat ----------
//   async function openPersonalChat(otherUserId) {
//     try {
//       const res = await fetch(`${API_BASE}/conversations/personal`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: me.id, otherUserId }),
//       });

//       const convo = await res.json();

//       if (!res.ok) {
//         toast.error(convo?.error || "Failed to open chat");
//         return;
//       }

//       // add if not exists
//       setConversationList((prev) => {
//         const exists = prev.some((c) => String(c._id) === String(convo._id));
//         return exists ? prev : [convo, ...prev];
//       });

//       setActiveConversationId(convo._id);
//       setShowNewChat(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("Server connection error");
//     }
//   }

//   // ---------- Send Message ----------
//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || !activeConversationId || isChecking) return;

//     setIsChecking(true);
//     try {
//       const vRes = await fetch(`${API_BASE}/validate-message`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: me.id, text }),
//       });

//       const vData = await vRes.json().catch(() => ({}));

//       if (!vRes.ok) {
//         toast.error(vData?.error || "Validation failed");
//         return;
//       }

//       if (vData && vData.allowed === false) {
//         toast.error(vData.reason || "Message blocked due to harmful content.");

//         if (typeof vData?.strikes === "number") {
//             previousStrikesRef.current = vData.strikes;
//         }

//         setInput("");

//         if (vData.isBlocked) {
//             setTimeout(() => {
//                 alert("Your account has been blocked due to repeated violations.");
//                 window.location.href = "/";
//             }, 2000);
//         }
//         return;
//       }

//       if (typeof vData?.strikes === "number" && vData.strikes > 0) {
//          if (vData.strikes > previousStrikesRef.current) {
//             toast.warning(`Warning: You have ${vData.strikes} strikes.`);
//          }
//          previousStrikesRef.current = vData.strikes;
//       }

//       // 2) send message to conversation
//       const res = await fetch(`${API_BASE}/conversations/${activeConversationId}/messages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: me.id, text }),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         toast.error(data?.error || "Failed to send message");
//         return;
//       }


//       // 3) update messages cache
//       setMessagesByConversation((prev) => ({
//         ...prev,
//         [activeConversationId]: [...(prev[activeConversationId] ?? []), data],
//       }));

//       // 4) update conversation preview (local)
//       setConversationList((prev) => {
//         const updated = prev.map((c) =>
//           String(c._id) === String(activeConversationId)
//             ? {
//                 ...c,
//                 lastMessageText: text,
//                 lastMessageAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString(),
//               }
//             : c
//         );

//         // move active to top (UI feels better)
//         const active = updated.find((c) => String(c._id) === String(activeConversationId));
//         const rest = updated.filter((c) => String(c._id) !== String(activeConversationId));
//         return active ? [active, ...rest] : updated;
//       });

//       setInput("");
//     } catch (err) {
//       console.error(err);
//       toast.error("Server connection error");
//     } finally {
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
//           <div className={styles.chatsTitle} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
//             <span>Chats</span>
//             <button
//               className={styles.sendBtn}
//               style={{ padding: "6px 10px", fontSize: 12 }}
//               onClick={() => setShowNewChat((s) => !s)}
//             >
//               {showNewChat ? "Close" : "New"}
//             </button>
//           </div>
//           <div className={styles.loggedInAs}>Logged in as: {me.name}</div>
//         </div>

//         {/* New Chat panel (simple) */}
//         {showNewChat && (
//           <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
//             <div style={{ fontSize: 13, marginBottom: 8 }}>Start a personal chat:</div>
//             {loadingUsers ? (
//               <div style={{ padding: 6 }}>Loading users...</div>
//             ) : usersError ? (
//               <div style={{ padding: 6, color: "crimson" }}>{usersError}</div>
//             ) : users.length === 0 ? (
//               <div style={{ padding: 6 }}>No users found</div>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto" }}>
//                 {users.map((u) => (
//                   <button
//                     key={u.id}
//                     className={styles.userItem}
//                     onClick={() => openPersonalChat(u.id)}
//                     style={{ textAlign: "left" }}
//                   >
//                     {u.name}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div className={styles.userList}>
//           {loadingConversations ? (
//             <div style={{ padding: 12 }}>Loading chats...</div>
//           ) : conversationsError ? (
//             <div style={{ padding: 12, color: "crimson" }}>{conversationsError}</div>
//           ) : conversationList.length === 0 ? (
//             <div style={{ padding: 12 }}>No conversations yet. Click “New” to start.</div>
//           ) : (
//             conversationList.map((c) => (
//               <button
//                 key={c._id}
//                 onClick={() => setActiveConversationId(c._id)}
//                 className={`${styles.userItem} ${
//                   String(c._id) === String(activeConversationId) ? styles.userItemActive : ""
//                 }`}
//               >
//                 <div className={styles.userRow}>
//                   <div className={styles.avatar}>{conversationTitle(c).slice(0, 1)}</div>

//                   <div className={styles.userMeta}>
//                     <div className={styles.userName}>
//                       {conversationTitle(c)}{" "}
//                       <span
//                         className={styles.statusDot}
//                         style={{ background: "#2ecc71" }}
//                         title={c.type}
//                       />
//                     </div>

//                     <div className={styles.preview}>{conversationPreview(c)}</div>
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
//           <div className={styles.activeUserName}>
//             {activeConversation ? conversationTitle(activeConversation) : "Chat"}
//           </div>
//           <div className={styles.activeUserStatus}>
//             {activeConversation ? (activeConversation.type === "group" ? "Group" : "Personal") : ""}
//           </div>
//         </header>

//         <div className={styles.messages}>
//           {!activeConversationId ? (
//             <div className={styles.emptyState}>Select a chat to start</div>
//           ) : activeMessages.length === 0 ? (
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
//             placeholder={
//               isChecking
//                 ? "Sending..."
//                 : activeConversation
//                 ? `Message ${conversationTitle(activeConversation)}`
//                 : "Select a chat..."
//             }
//             disabled={!activeConversationId || isChecking}
//             style={{ opacity: isChecking ? 0.7 : 1 }}
//           />
//           <button
//             className={styles.sendBtn}
//             onClick={sendMessage}
//             disabled={!activeConversationId || isChecking}
//             style={{
//               opacity: isChecking ? 0.7 : 1,
//               cursor: isChecking ? "wait" : "pointer",
//             }}
//           >
//             {isChecking ? "..." : "Send"}
//           </button>
//         </footer>
//       </section>
//     </div>
//   );
// }

import { useEffect, useMemo, useState, useRef } from "react";
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
  const previousStrikesRef = useRef(0);

  const API_BASE = useMemo(
    () => (import.meta.env.VITE_SERVER_API_URL || "").replace(/\/$/, ""),
    []
  );

  // Users (for creating chats + mapping IDs -> names)
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Conversations list from server
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

  // "Start new chat" UI
  const [showNewChat, setShowNewChat] = useState(false);

  // New: personal vs group creation
  const [newChatMode, setNewChatMode] = useState("personal"); // "personal" | "group"
  const [groupTopic, setGroupTopic] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  function resetNewChatUI() {
    setNewChatMode("personal");
    setGroupTopic("");
    setSelectedUserIds([]);
  }

  function toggleSelectedUser(id) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

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
    () =>
      conversationList.find((c) => String(c._id) === String(activeConversationId)) ||
      null,
    [conversationList, activeConversationId]
  );

  const activeMessages = messagesByConversation[activeConversationId] ?? [];

  // Map: userId -> name (includes me)
  const usersMap = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(String(u.id), u.name));
    m.set(String(me.id), me.name);
    return m;
  }, [users, me.id, me.name]);

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

    const otherId = getOtherUserIdForPersonal(convo);
    const otherUser = users.find((u) => String(u.id) === String(otherId));
    return otherUser ? otherUser.name : "Personal chat";
  };

  const conversationPreview = (convo) => {
    const text = convo?.lastMessageText || "";
    return text ? text : "No messages yet";
  };

  const groupMembersLabel = (convo, { maxNames = 3 } = {}) => {
    if (!convo || convo.type !== "group") return "";

    const ids = (convo.participants || []).map(String);
    const names = ids
      .map((id) => usersMap.get(id) || "Unknown")
      .filter((name) => name !== me.name); // remove me (optional)

    if (names.length === 0) return "Members: —";

    const shown = names.slice(0, maxNames);
    const rest = names.length - shown.length;

    return rest > 0
      ? `Members: ${shown.join(", ")} +${rest}`
      : `Members: ${shown.join(", ")}`;
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

      setConversationList((prev) => {
        const exists = prev.some((c) => String(c._id) === String(convo._id));
        return exists ? prev : [convo, ...prev];
      });

      setActiveConversationId(convo._id);
      setShowNewChat(false);
      resetNewChatUI();
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    }
  }

  // ---------- Create group chat ----------
  async function createGroupChat() {
    try {
      const topic = groupTopic.trim();
      if (!topic) {
        toast.error("Please enter a group name");
        return;
      }

      // choose at least 2 others (group will include me -> 3+)
      if (selectedUserIds.length < 2) {
        toast.error("Select at least 2 users for a group");
        return;
      }

      const res = await fetch(`${API_BASE}/conversations/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: me.id,
          topic,
          participantIds: selectedUserIds,
        }),
      });

      const convo = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(convo?.error || "Failed to create group");
        return;
      }

      setConversationList((prev) => [convo, ...prev]);
      setActiveConversationId(convo._id);

      setShowNewChat(false);
      resetNewChatUI();
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

      // update messages
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] ?? []), data],
      }));

      // update conversation preview + move to top
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
          <div
            className={styles.chatsTitle}
            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
          >
            <span>Chats</span>
            <button
              className={styles.sendBtn}
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={() => {
                setShowNewChat((s) => !s);
                if (showNewChat) resetNewChatUI();
              }}
            >
              {showNewChat ? "Close" : "New"}
            </button>
          </div>
          <div className={styles.loggedInAs}>Logged in as: {me.name}</div>
        </div>

        {/* New Chat panel */}
        {showNewChat && (
          <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                className={styles.sendBtn}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  opacity: newChatMode === "personal" ? 1 : 0.6,
                }}
                onClick={() => {
                  setNewChatMode("personal");
                  setGroupTopic("");
                  setSelectedUserIds([]);
                }}
              >
                Personal
              </button>

              <button
                className={styles.sendBtn}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  opacity: newChatMode === "group" ? 1 : 0.6,
                }}
                onClick={() => {
                  setNewChatMode("group");
                  setGroupTopic("");
                  setSelectedUserIds([]);
                }}
              >
                Group
              </button>
            </div>

            {newChatMode === "group" && (
              <>
                <input
                  className={styles.input}
                  value={groupTopic}
                  onChange={(e) => setGroupTopic(e.target.value)}
                  placeholder="Group name"
                  style={{ marginBottom: 10 }}
                />
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                  Select at least 2 users
                </div>
              </>
            )}

            {loadingUsers ? (
              <div style={{ padding: 6 }}>Loading users...</div>
            ) : usersError ? (
              <div style={{ padding: 6, color: "crimson" }}>{usersError}</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 6 }}>No users found</div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 220,
                  overflow: "auto",
                }}
              >
                {users.map((u) =>
                  newChatMode === "personal" ? (
                    <button
                      key={u.id}
                      className={styles.userItem}
                      onClick={() => openPersonalChat(u.id)}
                      style={{ textAlign: "left" }}
                    >
                      {u.name}
                    </button>
                  ) : (
                    <label
                      key={u.id}
                      className={styles.userItem}
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => toggleSelectedUser(u.id)}
                      />
                      <span>{u.name}</span>
                    </label>
                  )
                )}
              </div>
            )}

            {newChatMode === "group" && (
              <button
                className={styles.sendBtn}
                style={{ marginTop: 10, width: "100%" }}
                onClick={createGroupChat}
                disabled={!groupTopic.trim() || selectedUserIds.length < 2}
              >
                Create Group
              </button>
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

                    <div className={styles.preview}>
                      {conversationPreview(c)}
                      {c.type === "group" && (
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                          {groupMembersLabel(c, { maxNames: 2 })}
                        </div>
                      )}
                    </div>
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
            {activeConversation
              ? activeConversation.type === "group"
                ? groupMembersLabel(activeConversation, { maxNames: 4 })
                : "Personal"
              : ""}
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

