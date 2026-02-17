import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Divider,
} from "@mui/material";
import {
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";

export default function LoginPage() {
  const params = useLocalSearchParams(); // ?redirect=/profile
  const { login } = useAuth();

  const [email, setEmail] = useState("mesuvash@hotmail.com");
  const [password, setPassword] = useState("11111111");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
//////////////////// forgot password states
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg, setFpMsg] = useState("");
//////////////////////////
  const handleLogin = async () => {
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Login failed");
      if (!data?.token) throw new Error("Token not received from server.");

      // ✅ update context + persist token
      await login(data.token);

      const redirectTo =
        typeof params.redirect === "string" ? params.redirect : "/profile";

      // ✅ one tick delay prevents guard race conditions
      setTimeout(() => {
        router.replace(redirectTo);
      }, 0);
    } catch (e) {
      setErrorMsg(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
 
  setFpMsg("");
  const clean = fpEmail.trim().toLowerCase();
  if (!clean) return setFpMsg("Please enter your email.");

  try {
    alert("I am sending reset link");
    setFpLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: clean }),
    });
    alert("here is the link:", res);
    const data = await res.json().catch(() => ({}));
    setFpMsg(data?.message || "If that email exists, a reset link has been sent.");
  } catch {
    setFpMsg("Something went wrong. Please try again.");
  } finally {
    setFpLoading(false);
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 3,
            backgroundColor: "#2563eb",
            color: "white",
            boxShadow: "0px 12px 30px rgba(37, 99, 235, 0.35)",
          }}
        >
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
            Welcome To FixFinder
          </Typography>

          <Typography variant="body2" align="center" sx={{ opacity: 0.85 }} mb={2}>
            Sign in to your account
          </Typography>

          {errorMsg ? (
            <Typography sx={{ background: "rgba(0,0,0,0.2)", p: 1.2, borderRadius: 2, mb: 1 }}>
              {errorMsg}
            </Typography>
          ) : null}

          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Link
          underline="hover"
          sx={{ color: "#bfdbfe", fontWeight: 600, cursor: "pointer" }}
          onClick={() => {
            setFpEmail(email || "");
            setFpMsg("");
            setFpOpen(true);
          }}
        >
          Forgot password?
        </Link>
      </Box>

          <Button
            fullWidth
            disabled={loading}
            onClick={handleLogin}
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 700,
              backgroundColor: "#1e40af",
              color: "white",
              borderRadius: 2,
              boxShadow: "0px 6px 16px rgba(30, 64, 175, 0.45)",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.3)" }} />

          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            Don’t have an account?{" "}
            <Link
              underline="hover"
              sx={{ color: "#bfdbfe", fontWeight: 600, cursor: "pointer" }}
              onClick={() => router.push("/register")}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
      <Dialog open={fpOpen} onClose={() => setFpOpen(false)}>
  <DialogTitle>Reset Password</DialogTitle>
  <DialogContent>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Enter your email and we’ll send a password reset link.
    </Typography>
    <TextField
      label="Email"
      type="email"
      fullWidth
      margin="dense"
      value={fpEmail}
      onChange={(e) => setFpEmail(e.target.value)}
    />
    {fpMsg ? <Typography sx={{ mt: 1 }}>{fpMsg}</Typography> : null}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {setFpOpen(false); alert("sending link")}}>Cancel</Button>
    <Button disabled={fpLoading} onClick={handleForgotPassword}>
      {fpLoading ? "Sending..." : "OK"}
    </Button>
  </DialogActions>
</Dialog>
    </Container>
  );
}