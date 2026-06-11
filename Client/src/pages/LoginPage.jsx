import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import Spinner from "../components/ui/Spinner";

// Warm neutral palette — matches sidebar/body
const T = {
  bg:        '#F5F3F0',
  border:    '#E7E4E0',
  borderFocus: '#A8A29E',
  text:      '#1C1917',
  label:     '#78716C',
  muted:     '#A8A29E',
  inputBg:   '#FAFAF9',
  card:      '#ffffff',
  primary:   '#1C1917',
  primaryHover: '#292524',
};

export default function LoginPage() {
  const { login } = useAuth();
  const showToast = useToast();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key !== import.meta.env.VITE_ACCESS_KEY) {
      window.location.replace("https://www.google.com");
    } else {
      setAllowed(true);
    }
  }, []);

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
        background: T.bg,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            background: T.card,
            borderRadius: "20px",
            border: `1px solid ${T.border}`,
            boxShadow: "0 8px 32px rgba(28,25,23,0.10), 0 2px 8px rgba(28,25,23,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Top accent bar — warm dark, not multicolor */}
          <div style={{ height: "3px", width: "100%", background: T.primary }} />

          <div style={{ padding: "32px" }}>
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <div
                style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: T.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                  Techversity
                </p>
                <p style={{ fontSize: "11px", fontWeight: 500, color: T.muted }}>
                  Finance Portal
                </p>
              </div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: T.text, letterSpacing: "-0.03em", margin: 0 }}>
                Sign in
              </h1>
              <p style={{ fontSize: "13px", color: T.label, marginTop: "4px" }}>
                Admin access only. Enter your credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Username */}
              <div>
                <label
                  style={{ display: "block", fontSize: "10px", fontWeight: 700,
                    color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: T.muted }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    style={{
                      width: "100%", paddingLeft: "36px", paddingRight: "12px",
                      paddingTop: "10px", paddingBottom: "10px",
                      borderRadius: "10px",
                      border: `1px solid ${error ? "#FCA5A5" : T.border}`,
                      background: error ? "#FFF5F5" : T.inputBg,
                      fontSize: "13px", color: T.text, outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.borderFocus}
                    onBlur={e => e.target.style.borderColor = error ? "#FCA5A5" : T.border}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  style={{ display: "block", fontSize: "10px", fontWeight: 700,
                    color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: T.muted }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      width: "100%", paddingLeft: "36px", paddingRight: "40px",
                      paddingTop: "10px", paddingBottom: "10px",
                      borderRadius: "10px",
                      border: `1px solid ${error ? "#FCA5A5" : T.border}`,
                      background: error ? "#FFF5F5" : T.inputBg,
                      fontSize: "13px", color: T.text, outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.borderFocus}
                    onBlur={e => e.target.style.borderColor = error ? "#FCA5A5" : T.border}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: T.muted,
                      padding: 0, display: "flex", alignItems: "center",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = T.text}
                    onMouseLeave={e => e.currentTarget.style.color = T.muted}
                  >
                    {showPass ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "#FFF5F5", border: "1px solid #FCA5A5",
                    borderRadius: "10px", padding: "10px 12px",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#DC2626", margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "11px 16px", marginTop: "4px",
                  borderRadius: "10px", border: "none",
                  background: loading ? "#57534E" : T.primary,
                  color: "#ffffff", fontSize: "13px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background 0.15s",
                  opacity: loading ? 0.75 : 1,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.primaryHover; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.primary; }}
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

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: "11px", color: T.muted, marginTop: "20px" }}>
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}