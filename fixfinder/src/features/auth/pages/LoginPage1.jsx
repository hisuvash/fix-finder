import { useState } from "react";
import { router } from "expo-router";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Divider,
} from "@mui/material";

const API_BASE_URL = "http://localhost:5001";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed");

      localStorage.setItem("ff_token", data.token);
      router.replace("/profile");
    } catch (e) {
      setErrorMsg(e?.message || "Login failed");
    } finally {
      setLoading(false);
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
              sx={{ color: "#bfdbfe", fontWeight: 600 }}
              onClick={() => router.push("/register")}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}