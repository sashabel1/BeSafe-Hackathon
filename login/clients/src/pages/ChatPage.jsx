import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUserById } from "../lib/usersApi";

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [other, setOther] = useState(null);

  useEffect(() => {
    (async () => {
      try {
       
        if (String(id).startsWith("demo-")) {
          setOther({
            _id: id,
            name: "Demo User",
            nickname: id,
            profilePic: "/avatar.png",
          });
          return;
        }

        const res = await fetchUserById(id);
        setOther(res.user);
      } catch {
        
        navigate("/home", { replace: true });
      }
    })();
  }, [id, navigate]);

  const name = other?.nickname || other?.name || "User";
  const avatar = other?.profilePic || "/avatar.png";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6">
      <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button
            onClick={() => navigate("/home")}
            className="rounded-xl bg-white/10 hover:bg-white/15 text-white px-3 py-2 text-sm border border-white/10 transition"
          >
            ← Back
          </button>

          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="text-white font-semibold truncate">{name}</div>
            <div className="text-xs text-white/60">Chat</div>
          </div>
        </div>

        
        <div className="p-6 text-white/70">
          כאן יהיה הצ’אט מול <span className="text-white">{name}</span>.
          <br />
          (בשלב הבא נחבר הודעות אמיתיות ל־DB / Socket.io)
        </div>
      </div>
    </div>
  );
}
