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

      // update context + persist token
      await login(data.token);

      const redirectTo =
        typeof params.redirect === "string" ? params.redirect : "/profile";

      // one tick delay prevents guard race conditions
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
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", py: 3, marginTop: "-100px" }}>
        <Box
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 2,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom sx={{ color: "#263c91" }}>
            Welcome To FixFinder
          </Typography>

          <Typography variant="body2" align="center" sx={{ color: "#263c91", opacity: 0.9 }} mb={2}>
            Sign in to your account
          </Typography>

          {errorMsg ? (
            <Typography sx={{ background: "rgba(220, 38, 38, 0.1)", color: "#b91c1c", p: 1.2, borderRadius: 2, mb: 1, fontSize: 14 }}>
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
            InputLabelProps={{ style: { color: "#263c91" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#263c91" },
                "&:hover fieldset": { borderColor: "#5063f9" },
                "&.Mui-focused fieldset": { borderColor: "#5063f9", borderWidth: 2 },
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#263c91" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                "& fieldset": { borderColor: "#263c91" },
                "&:hover fieldset": { borderColor: "#5063f9" },
                "&.Mui-focused fieldset": { borderColor: "#5063f9", borderWidth: 2 },
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Link
          underline="hover"
          sx={{
            color: "#5063f9",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          }}
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
              backgroundColor: "#5063f9",
              color: "white",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(80, 99, 249, 0.35)",
              "&:hover": { backgroundColor: "#3d4fd9" },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Divider sx={{ my: 3, borderColor: "#263c91", opacity: 0.3 }} />

          <Typography variant="body2" align="center" sx={{ color: "#263c91" }}>
            Don’t have an account?{" "}
            <Link
              underline="hover"
              sx={{
                color: "#5063f9",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              }}
              onClick={() => router.push("/register")}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
      <Dialog open={fpOpen} onClose={() => setFpOpen(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ color: "#263c91", fontWeight: 700 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1, color: "#263c91" }}>
            Enter your email and we’ll send a password reset link.
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="dense"
            value={fpEmail}
            onChange={(e) => setFpEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#263c91" } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#263c91" },
                "&.Mui-focused fieldset": { borderColor: "#5063f9" },
              },
            }}
          />
          {fpMsg ? <Typography sx={{ mt: 1, color: "#263c91" }}>{fpMsg}</Typography> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFpOpen(false)} sx={{ color: "#263c91" }}>Cancel</Button>
          <Button
            disabled={fpLoading}
            onClick={handleForgotPassword}
            sx={{ backgroundColor: "#5063f9", color: "white", fontWeight: 600, "&:hover": { backgroundColor: "#3d4fd9" } }}
          >
            {fpLoading ? "Sending..." : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}