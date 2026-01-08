import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";
import { fetchUsers, fetchUserById } from "../lib/usersApi";

function MeCard() {
  const { authUser } = useAuthStore();

  const displayName = useMemo(() => {
    return authUser?.nickname || authUser?.name || "User";
  }, [authUser]);

  const avatar = authUser?.profilePic || "/avatar.png";

  return (
    <div className="rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full overflow-hidden border border-white/15 bg-white/5">
          <img src={avatar} alt="me" className="h-full w-full object-cover" />
        </div>

        <div className="leading-tight">
          <div className="text-white font-semibold">{displayName}</div>
          <div className="text-xs text-emerald-300">Online</div>
        </div>
      </div>
    </div>
  );
}

function UsersList({ users, onSelect }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-white font-semibold">All users</div>
        <div className="text-xs text-white/60">{users.length} users</div>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        {users.map((u) => {
          const name = u.nickname || u.name || "User";
          const avatar = u.profilePic || "/avatar.png";

          return (
            <button
              key={u._id}
              onClick={() => onSelect(u._id)}
              className="w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-center gap-3 border-b border-white/5"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                <img
                  src={avatar}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="text-white font-medium truncate">{name}</div>
                <div className="text-xs text-white/50 truncate">
                  {u.isProfileComplete ? "Profile complete" : "New user"}
                </div>
              </div>
            </button>
          );
        })}

        {users.length === 0 && (
          <div className="p-4 text-white/70">No users found.</div>
        )}
      </div>
    </div>
  );
}
function MyFriendsList({ friends, onSelect }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-white font-semibold">My friends</div>
        <div className="text-xs text-white/60">{friends.length} friends</div>
      </div>

      <div className="max-h-[45vh] overflow-auto">
        {friends.map((f) => {
          const name = f.nickname || f.name || "Friend";
          const avatar = f.profilePic || "/avatar.png";

          return (
            <button
              key={f._id}
              onClick={() => onSelect(f)}
              className="w-full text-left px-4 py-3 hover:bg-white/5 transition flex items-center gap-3 border-b border-white/5"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="text-white font-medium truncate">{name}</div>
                <div className="text-xs text-white/50 truncate">Friend</div>
              </div>
            </button>
          );
        })}

        {friends.length === 0 && (
          <div className="p-4 text-white/70">No friends yet. Add someone 🙂</div>
        )}
      </div>
    </div>
  );
}


function ProfileModal({ open, onClose, user, onAddFriend, onChat, isFriend }) {
  if (!open) return null;

  const name = user?.nickname || user?.name || "User";
  const avatar = user?.profilePic || "/avatar.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full overflow-hidden border border-white/15 bg-white/5">
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-white text-lg font-semibold">{name}</div>
            <div className="text-xs text-white/60">
              {user?.isProfileComplete ? "Profile complete" : "Profile not complete"}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-white/80">
          <div>
            <span className="text-white/50">Age:</span> {user?.age ?? "—"}
          </div>
          <div>
            <span className="text-white/50">Gender:</span> {user?.gender || "—"}
          </div>
          <div>
            <span className="text-white/50">Joined:</span>{" "}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between gap-2">
          <button
            onClick={() => onAddFriend(user)}
            disabled={isFriend}
            className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white px-4 py-2 text-sm border border-white/10 transition"
          >
            {isFriend ? "Added ✅" : "Add friend"}
          </button>

          <button
            onClick={() => onChat(user)}
            className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 text-sm font-semibold transition"
          >
            Chat
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-4 py-2 text-sm border border-white/10 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate(); // ✅ עכשיו משתמשים בו
  const { logout } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Friends (demo) saved in localStorage
  const [friends, setFriends] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("friends") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        const res = await fetchUsers();
        setUsers(res.users || []);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // Demo users (always show at least 10)
  const demoUsers = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        _id: `demo-${i}`,
        name: `Demo User ${i + 1}`,
        nickname: `demo${i + 1}`,
        profilePic: "/avatar.png",
        isProfileComplete: true,
        age: 20,
        gender: "other",
        createdAt: new Date().toISOString(),
      })),
    []
  );

  const usersToShow =
    users.length >= 10 ? users : [...users, ...demoUsers].slice(0, 10);

  async function handleSelectUser(userId) {
    // demo user
    if (String(userId).startsWith("demo-")) {
      const u = usersToShow.find((x) => x._id === userId);
      setSelectedUser(u);
      setOpen(true);
      return;
    }

    try {
      const res = await fetchUserById(userId);
      setSelectedUser(res.user);
      setOpen(true);
    } catch {
      // ignore
    }
  }

  function addFriend(user) {
    if (!user?._id) return;

    const exists = friends.some((f) => f._id === user._id);
    if (exists) return;

    const minimal = {
      _id: user._id,
      name: user.name || "",
      nickname: user.nickname || "",
      profilePic: user.profilePic || "/avatar.png",
    };

    const next = [minimal, ...friends];
    setFriends(next);
    localStorage.setItem("friends", JSON.stringify(next));
  }

  const isFriend = selectedUser
    ? friends.some((f) => f._id === selectedUser._id)
    : false;

  function goChat(user) {
    if (!user?._id) return;
    setOpen(false);
    navigate(`/chat/${user._id}`); // ✅ כאן משתמשים ב-navigate
  }

  return (
   <div className="w-full min-h-screen">
    <div className="w-full max-w-7xl mx-auto px-6 pt-6">
      <div className="flex items-start justify-between gap-8">
          {/* LEFT */}
           <div className="w-[280px] space-y-3">
            <MeCard />
              {/* ✅ כאן באמצע */}
  <MyFriendsList
    friends={friends}
    onSelect={(f) => {
      setSelectedUser(f);
      setOpen(true);
    }}
  />
          <button
            onClick={logout}
            className="w-full rounded-2xl bg-rose-400 hover:bg-rose-300 text-slate-900 font-semibold py-3 transition shadow-xl"
          >
            Logout
          </button>
        </div>
        

          {/* RIGHT */}
          <div className="md:justify-self-end w-full md:w-[360px]">
            {loadingUsers ? (
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 text-white/70">
                Loading users...
              </div>
            ) : (
              <UsersList users={usersToShow} onSelect={handleSelectUser} />
            )}
          </div>
        </div>
      </div>

      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        user={selectedUser}
        isFriend={isFriend}
        onAddFriend={addFriend}
        onChat={goChat}
      />
    </div>
  );
}
