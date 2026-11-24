import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Mic,
  MonitorSmartphone,
  Sparkles,
  User,
  WandSparkles
} from "lucide-react";

import logo from "../assets/pixelpilot-logo.webp";
import { friendlyAuthError, isSupabaseConfigured, supabase } from "../lib/supabase";
import "../styles/AuthPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkPassword(password) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return "";
}

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to keep building with PixelPilot.",
    button: "Sign In"
  },
  register: {
    title: "Create your account",
    subtitle: "Start turning ideas into website sections in seconds.",
    button: "Create Account"
  },
  forgot: {
    title: "Reset your password",
    subtitle: "Enter your email and we'll send you a link to choose a new password.",
    button: "Send Reset Link"
  },
  reset: {
    title: "Choose a new password",
    subtitle: "Pick something you haven't used before.",
    button: "Save New Password"
  }
};

function PasswordField({ id, label, value, onChange, autoComplete, show, onToggle }) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <div className="auth-input">
        <Lock size={16} aria-hidden="true" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-eye"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function AuthPage({ recovering = false, onRecovered, onSignInStart }) {
  const [mode, setMode] = useState(recovering ? "reset" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const activeMode = recovering ? "reset" : mode;
  const copy = COPY[activeMode];

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
  };

  const validate = () => {
    if (activeMode !== "reset" && !EMAIL_PATTERN.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (activeMode === "register" && !name.trim()) return "Please tell us your name.";
    if (activeMode === "login" && !password) return "Please enter your password.";
    if (activeMode === "register" || activeMode === "reset") {
      const problem = checkPassword(password);
      if (problem) return problem;
      if (password !== confirm) return "The two passwords don't match.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError("");
    setInfo("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (activeMode === "login") {
        // Flag this as a fresh login *before* Supabase reports the session,
        // so Pixie knows to greet the user when the workspace opens.
        onSignInStart?.();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (signInError) throw signInError;
      }

      if (activeMode === "register") {
        onSignInStart?.();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin
          }
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          // Email confirmation is on (Supabase's default).
          setInfo(
            `Almost there! We've sent a confirmation link to ${cleanEmail}. Click it, then come back and sign in.`
          );
          setMode("login");
          setPassword("");
          setConfirm("");
        }
      }

      if (activeMode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
        if (resetError) throw resetError;
        // Same message whether or not the account exists, so emails can't be probed.
        setInfo(`If an account exists for ${cleanEmail}, a reset link is on its way. Check your inbox.`);
      }

      if (activeMode === "reset") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setPassword("");
        setConfirm("");
        onRecovered?.();
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <img src={logo} alt="PixelPilot AI" className="auth-logo" width="520" height="173" />
        <h1>
          Describe it.
          <span className="gradient-text"> We'll build it.</span>
        </h1>
        <p>
          PixelPilot turns plain-English ideas into responsive website sections you can preview,
          copy and publish.
        </p>
        <ul className="auth-features">
          <li>
            <WandSparkles size={18} />
            Heroes, navbars, pricing, forms and full pages
          </li>
          <li>
            <MonitorSmartphone size={18} />
            Live desktop &amp; mobile preview
          </li>
          <li>
            <Mic size={18} />
            Meet Pixie, your voice guide
          </li>
        </ul>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <img src={logo} alt="PixelPilot AI" className="auth-logo-mobile" width="520" height="173" />

          {!isSupabaseConfigured ? (
            <div className="auth-setup">
              <div className="auth-icon">
                <KeyRound size={22} />
              </div>
              <h2>Sign-in isn&apos;t set up yet</h2>
              <p>
                Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{" "}
                <code>.env</code> file, then restart <code>npm run dev</code>. The README explains
                where to find them.
              </p>
            </div>
          ) : (
            <>
              {activeMode === "forgot" && (
                <button type="button" className="auth-back" onClick={() => switchMode("login")}>
                  <ArrowLeft size={15} />
                  Back to sign in
                </button>
              )}

              {(activeMode === "login" || activeMode === "register") && (
                <div className="auth-tabs" role="tablist" aria-label="Sign in or create account">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "login"}
                    className={activeMode === "login" ? "active" : ""}
                    onClick={() => switchMode("login")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeMode === "register"}
                    className={activeMode === "register" ? "active" : ""}
                    onClick={() => switchMode("register")}
                  >
                    Register
                  </button>
                </div>
              )}

              <h2>{copy.title}</h2>
              <p className="auth-subtitle">{copy.subtitle}</p>

              {error && (
                <div className="auth-message auth-error" role="alert">
                  {error}
                </div>
              )}
              {info && (
                <div className="auth-message auth-info" role="status">
                  {info}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {activeMode === "register" && (
                  <label className="auth-field" htmlFor="auth-name">
                    <span>Your name</span>
                    <div className="auth-input">
                      <User size={16} aria-hidden="true" />
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        maxLength={40}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="e.g. Ruth"
                        required
                      />
                    </div>
                  </label>
                )}

                {activeMode !== "reset" && (
                  <label className="auth-field" htmlFor="auth-email">
                    <span>Email address</span>
                    <div className="auth-input">
                      <Mail size={16} aria-hidden="true" />
                      <input
                        id="auth-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </label>
                )}

                {activeMode !== "forgot" && (
                  <PasswordField
                    id="auth-password"
                    label={activeMode === "reset" ? "New password" : "Password"}
                    value={password}
                    onChange={setPassword}
                    autoComplete={activeMode === "login" ? "current-password" : "new-password"}
                    show={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                  />
                )}

                {(activeMode === "register" || activeMode === "reset") && (
                  <>
                    <PasswordField
                      id="auth-confirm"
                      label="Confirm password"
                      value={confirm}
                      onChange={setConfirm}
                      autoComplete="new-password"
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                    />
                    <p className="auth-hint">At least 8 characters, with a letter and a number.</p>
                  </>
                )}

                {activeMode === "login" && (
                  <button type="button" className="auth-link" onClick={() => switchMode("forgot")}>
                    Forgot password?
                  </button>
                )}

                <button type="submit" className="auth-submit" disabled={busy}>
                  {busy ? <span className="loading-spinner" /> : <Sparkles size={16} />}
                  {busy ? "Please wait..." : copy.button}
                </button>
              </form>

              {activeMode === "login" && (
                <p className="auth-switch">
                  New to PixelPilot?{" "}
                  <button type="button" onClick={() => switchMode("register")}>
                    Create an account
                  </button>
                </p>
              )}
              {activeMode === "register" && (
                <p className="auth-switch">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    Sign in
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
