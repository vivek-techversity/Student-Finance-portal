import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import Spinner from "../components/ui/Spinner";

export default function LoginPage() {
  const { login } = useAuth();
  const showToast = useToast();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [allowed, setAllowed] = useState(false); // ✅ new

  // ✅ Secret key check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key !== import.meta.env.VITE_ACCESS_KEY) {
      window.location.replace("https://www.google.com");
    } else {
      setAllowed(true);
    }
  }, []);

  // ✅ Jab tak check ho, kuch mat dikhao
  if (!allowed) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("Both fields are required.");
      return;
    }
    try {
      setLoading(true);
      await login(form.username.trim(), form.password);
      showToast("Welcome back!", "success");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 40%, #f0f9ff 70%, #fdf4ff 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none fixed top-[-140px] right-[-120px] w-[520px] h-[520px] rounded-full opacity-[0.18]"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-[-100px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.12]"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow:
              "0 20px 60px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(139,92,246,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Top gradient bar */}
          <div
            style={{
              height: "3px",
              width: "100%",
              background:
                "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #06b6d4)",
            }}
          />

          <div className="px-8 pt-8 pb-10">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-slate-800 leading-tight">
                  Techversity
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Finance Portal
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Sign in
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Admin access only. Enter your credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="admin"
                    autoComplete="username"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50
                      placeholder:text-slate-400 outline-none transition-all
                      focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                      ${error ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      WebkitTextSecurity: showPass ? "none" : undefined,
                    }}
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50
                      placeholder:text-slate-400 outline-none transition-all
                      focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                      [&::-ms-reveal]:hidden [&::-ms-clear]:hidden
                      ${error ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-500 flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs font-medium text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white
                  bg-gradient-to-r from-indigo-500 to-violet-600
                  hover:from-indigo-600 hover:to-violet-700
                  active:scale-[0.98] transition-all shadow-sm shadow-indigo-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}