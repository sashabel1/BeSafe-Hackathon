import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAuthStore } from "./useAuthStore";

export default function ProfileSetupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { authUser, setToken, fetchMe, updateProfile } = useAuthStore();

  // אתחול "חד-פעמי" מה-authUser (אם כבר קיים)
  const [form, setForm] = useState(() => ({
    nickname: authUser?.nickname || "",
    age: authUser?.age ? String(authUser.age) : "",
    gender: authUser?.gender || "",
  }));

  const [avatarBase64, setAvatarBase64] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const fileInputRef = useRef(null);


  useEffect(() => {
    const t = params.get("token");
    if (!t) return;

    (async () => {
      try {
        setToken(t);
        const user = await fetchMe();

        setForm({
          nickname: user?.nickname || "",
          age: user?.age ? String(user.age) : "",
          gender: user?.gender || "",
        });

        // מנקים token מה-URL
        window.history.replaceState({}, "", "/profile-setup");
      } catch {
        navigate("/", { replace: true });
      }
    })();
  }, [params, setToken, fetchMe, navigate]);

  
  const didInitFromUserRef = useRef(false);
  useEffect(() => {
    if (didInitFromUserRef.current) return;
    if (!authUser) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      nickname: authUser.nickname || "",
      age: authUser.age ? String(authUser.age) : "",
      gender: authUser.gender || "",
    });

    didInitFromUserRef.current = true;
  }, [authUser]);

  const canSubmit = useMemo(() => {
    const ageNum = Number(form.age);
    return (
      form.nickname.trim().length >= 2 &&
      Number.isFinite(ageNum) &&
      ageNum >= 8 &&
      ageNum <= 120 &&
      ["female", "male", "other"].includes(form.gender)
    );
  }, [form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handlePickImage() {
    fileInputRef.current?.click();
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setAvatarBase64(String(reader.result));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setStatus({ type: "loading", message: "" });

      await updateProfile({
        nickname: form.nickname.trim(),
        age: Number(form.age),
        gender: form.gender,
        profilePic: avatarBase64 || authUser?.profilePic || "",
      });

      setStatus({ type: "success", message: "הפרופיל נשמר בהצלחה!" });
      navigate("/home", { replace: true });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "שמירת הפרופיל נכשלה. נסי שוב.",
      });
    }
  }

  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-2xl bg-slate-700/90 shadow-2xl border border-white/10 px-8 py-10">
        <h1 className="text-3xl font-semibold text-white text-center">
          Create Profile
        </h1>
        <p className="text-slate-300 text-center mt-2">
          Complete your profile to continue
        </p>

        {/* Avatar */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <button
              type="button"
              onClick={handlePickImage}
              className="w-24 h-24 rounded-full overflow-hidden bg-slate-600 border border-white/15 flex items-center justify-center"
              title="Upload profile image"
            >
              <img
                src={avatarBase64 || authUser?.profilePic || "/avatar.png"}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </button>

            <button
              type="button"
              onClick={handlePickImage}
              className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 transition flex items-center justify-center shadow-lg"
              title="Change photo"
            >
              <Camera className="w-5 h-5 text-slate-900" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-slate-300 text-sm mb-2">Nickname</label>
            <input
              name="nickname"
              value={form.nickname}
              onChange={onChange}
              className="w-full rounded-xl bg-slate-600/60 border border-white/10 px-4 py-3 text-white placeholder:text-slate-300/60 outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="Your nickname"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Age</label>
            <input
              name="age"
              value={form.age}
              onChange={onChange}
              type="number"
              className="w-full rounded-xl bg-slate-600/60 border border-white/10 px-4 py-3 text-white placeholder:text-slate-300/60 outline-none focus:ring-2 focus:ring-cyan-400/40"
              placeholder="e.g. 17"
              min={8}
              max={120}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full rounded-xl bg-slate-600/60 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <option value="" disabled>
                Choose...
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || status.type === "loading"}
            className="w-full mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:hover:bg-cyan-500 transition py-3 font-medium text-slate-900"
          >
            {status.type === "loading" ? "Saving..." : "Save Profile"}
          </button>

          {status.type === "error" && (
            <p className="text-red-200 text-sm text-center">{status.message}</p>
          )}
          {status.type === "success" && (
            <p className="text-green-200 text-sm text-center">{status.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
