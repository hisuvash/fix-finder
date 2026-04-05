import React, { useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { API_BASE_URL } from "../shared/config/api";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

export default function ResetPasswordPage() {
  const params = useLocalSearchParams();
  const token = useMemo(
    () => (typeof params.token === "string" ? params.token : ""),
    [params.token]
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async () => {
    setMsg("");
    if (!token) return setMsg("Reset token is missing or invalid.");
    if (!newPassword || !confirmPassword) return setMsg("Please fill both password fields.");
    if (newPassword !== confirmPassword) return setMsg("Passwords do not match.");
    if (newPassword.length < 8) return setMsg("Password must be at least 8 characters.");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Reset failed.");

      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 1200);
    } catch (e) {
      setMsg(e?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", p: 4, borderRadius: 3, boxShadow: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Reset Password
          </Typography>

          {msg ? <Typography sx={{ mb: 2 }}>{msg}</Typography> : null}

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button fullWidth disabled={loading} onClick={onSubmit} sx={{ mt: 2, py: 1.2 }}>
            {loading ? "Saving..." : "Save New Password"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}