import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // For now: just prove the UI works
    console.log({ email, password });
    alert("Login clicked ✅ (UI only for now)");
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label style={styles.label}>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={styles.input}
          required
        />
      </label>

      <label style={styles.label}>
        Password
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          style={styles.input}
          required
          minLength={6}
        />
      </label>

      <button type="submit" style={styles.button}>
        Sign in
      </button>

      <div style={styles.footer}>
        <span style={{ color: "#6b7280" }}>No account?</span>{" "}
        <a href="/register" style={styles.link}>Create one</a>
      </div>
    </form>
  );
}

const styles = {
  form: { display: "grid", gap: 14 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
  },
  button: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  footer: { marginTop: 6, fontSize: 14 },
  link: { textDecoration: "none", fontWeight: 600 },
};