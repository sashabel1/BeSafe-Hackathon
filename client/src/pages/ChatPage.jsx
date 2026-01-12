import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
//import styles from "../styles/ChatPage.module.css";
import { apiGet, apiPost } from "../lib/api"; 
import "../styles/ChatPage.css";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function safeName(u) {
  return u?.nickname || u?.email || u?.name || "User";
}

export default function ChatPage() {
  const previousStrikesRef = useRef(0);

  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

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

  // personal vs group creation
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

  // 0) Load ME (who is logged-in) from /auth/me
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        setMeLoading(true);
        const data = await apiGet("/auth/me"); // { user: {...} }
        const u = data.user;

        if (cancelled) return;
        setMe({
          id: u._id,
          name: u.nickname || u.email || "Me",
        });
      } catch {
        if (cancelled) return;
        setMe(null);
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  //  1) Load Users (רק אחרי שיש me)
  useEffect(() => {
    if (!me) return;
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        const dbUsers = await apiGet("/users");

        const mapped = dbUsers
          .filter((u) => String(u._id) !== String(me.id))
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
  }, [me]);

  // 2) Load Conversations (רק אחרי שיש me)
  useEffect(() => {
    if (!me) return;
    let cancelled = false;

    async function loadConversations() {
      try {
        setLoadingConversations(true);
        setConversationsError(null);

        const data = await apiGet(`/conversations?userId=${me.id}`);

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
  }, [me]);

  // 3) Load Messages for active conversation (cached)
  useEffect(() => {
    if (!me || !activeConversationId) return;
    let cancelled = false;

    async function loadMessages(conversationId) {
      if (messagesByConversation[conversationId]) return;

      const data = await apiGet(
        `/conversations/${conversationId}/messages?userId=${me.id}`
      );

      if (cancelled) return;
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: data }));
    }

    loadMessages(activeConversationId).catch((err) => {
      console.error(err);
      toast.error("Failed to load messages");
    });

    return () => {
      cancelled = true;
    };
  }, [me, activeConversationId, messagesByConversation]);

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
    if (me) m.set(String(me.id), me.name);
    return m;
  }, [users, me]);

  // ---------- Helpers for sidebar title ----------
  const getOtherUserIdForPersonal = (convo) => {
    if (!convo || convo.type !== "personal") return null;
    const ids = (convo.participants || []).map(String);
    const other = ids.find((id) => id !== String(me?.id));
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
      .filter((name) => name !== me?.name);

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
      const convo = await apiPost("/conversations/personal", {
        userId: me.id,
        otherUserId,
      });

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

      if (selectedUserIds.length < 2) {
        toast.error("Select at least 2 users for a group");
        return;
      }

      const convo = await apiPost("/conversations/group", {
        userId: me.id,
        topic,
        participantIds: selectedUserIds,
      });

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
    if (!text || !activeConversationId || isChecking || !me) return;

    setIsChecking(true);
    try {
      const vData = await apiPost("/validate-message", { userId: me.id, text });

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

      const data = await apiPost(`/conversations/${activeConversationId}/messages`, {
        userId: me.id,
        text,
      });

      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] ?? []), data],
      }));

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
      toast.error(err.message || "Server connection error");
    } finally {
      setIsChecking(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  //מצב טעינה/לא מחובר
  if (meLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!me) return <div style={{ padding: 20 }}>Please login</div>;

  return (
    <div className="chat-page-container">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="chats-title-row">
            <span>Chats</span>
            <button
              className="pink-button"
              style={{ padding: "6px 10px", fontSize: 12 }}
              onClick={() => {
                setShowNewChat((s) => !s);
                if (showNewChat) resetNewChatUI();
              }}
            >
              {showNewChat ? "Close" : "New"}
            </button>
          </div>
          <div className="logged-in-label">Logged in as: {me.name}</div>
        </div>

        {/* New Chat panel */}
        {showNewChat && (
          <div className="new-chat-panel">
            <div className="mode-toggle">
              <button
                className={`pink-button ${newChatMode === "personal" ? "active" : "outline"}`}
                style={{ flex: 1, padding: "8px", fontSize: 12 }}
                onClick={() => {
                  setNewChatMode("personal");
                  setGroupTopic("");
                  setSelectedUserIds([]);
                }}
              >
                Personal
              </button>

              <button
                className={`pink-button ${newChatMode === "group" ? "active" : "outline"}`}
                style={{ flex: 1, padding: "8px", fontSize: 12 }}
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
                  className="chat-input"
                  style={{ width: "100%", marginBottom: 10, boxSizing: "border-box" }}
                  value={groupTopic}
                  onChange={(e) => setGroupTopic(e.target.value)}
                  placeholder="Group name"
                />
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8, color: "#ff69b4" }}>
                  Select at least 2 users
                </div>
              </>
            )}

            {loadingUsers ? (
              <div style={{ padding: 6, color: "#999" }}>Loading users...</div>
            ) : usersError ? (
              <div style={{ padding: 6, color: "crimson" }}>{usersError}</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 6, color: "#999" }}>No users found</div>
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
                      className="user-item"
                      onClick={() => openPersonalChat(u.id)}
                    >
                      {u.name}
                    </button>
                  ) : (
                    <label
                      key={u.id}
                      className="user-item"
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
                className="create-group-btn"
                onClick={createGroupChat}
                disabled={!groupTopic.trim() || selectedUserIds.length < 2}
              >
                Create Group
              </button>
            )}
          </div>
        )}

        <div className="chat-user-list">
          {loadingConversations ? (
            <div style={{ padding: 12, color: "#999" }}>Loading chats...</div>
          ) : conversationsError ? (
            <div style={{ padding: 12, color: "crimson" }}>{conversationsError}</div>
          ) : conversationList.length === 0 ? (
            <div style={{ padding: 12, color: "#999" }}>No conversations yet. Click “New” to start.</div>
          ) : (
            conversationList.map((c) => (
              <button
                key={c._id}
                onClick={() => setActiveConversationId(c._id)}
                className={`user-item ${
                  String(c._id) === String(activeConversationId) ? "active" : ""
                }`}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "center", width: "100%" }}>
                  <div className="chat-avatar">{conversationTitle(c).slice(0, 1)}</div>

                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div className="chat-user-name">
                      {conversationTitle(c)}{" "}
                      <span
                        className="status-dot"
                        style={{ background: "#2ecc71" }}
                        title={c.type}
                      />
                    </div>

                    <div style={{ fontSize: "12px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conversationPreview(c)}
                      {c.type === "group" && (
                        <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
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
      <section className="chat-window">
        <header className="chat-window-header">
          <div className="active-user-name">
            {activeConversation ? conversationTitle(activeConversation) : "Chat"}
          </div>

          <div className="active-user-status">
            {activeConversation
              ? activeConversation.type === "group"
                ? groupMembersLabel(activeConversation, { maxNames: 4 })
                : "Personal"
              : ""}
          </div>
        </header>

        <div className="chat-messages-area">
          {!activeConversationId ? (
            <div style={{ textAlign: "center", color: "#ff85a2", marginTop: 40, fontWeight: 600 }}>Select a chat to start</div>
          ) : activeMessages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#ff85a2", marginTop: 40, fontWeight: 600 }}>No messages yet. Say hi 👋</div>
          ) : (
            activeMessages.map((m) => (
              <div
                key={m.id}
                className="message-row"
              >
                <div
                  className={`message-bubble ${
                    m.sender === "me" ? "msg-me" : "msg-them"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="message-time">{formatTime(m.ts)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="chat-input-bar">
          <input
            className="chat-input"
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
            className="send-button"
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