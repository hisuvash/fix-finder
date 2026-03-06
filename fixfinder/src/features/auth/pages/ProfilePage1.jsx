import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Box, Button, Container, Typography, Divider } from "@mui/material";

// ✅ Update if needed:
// - Expo Web: http://localhost:5000
// - Android emulator: http://10.0.2.2:5000
// - Physical phone: http://YOUR_PC_IP:5000
const API_BASE_URL = "http://localhost:5001";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const logout = () => {
    localStorage.removeItem("ff_token");
    router.replace("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("ff_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadMe = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        setUser(data.user);
      } catch (e) {
        setErrorMsg(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
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
            Profile
          </Typography>

          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }} mb={2}>
            Your profile data
          </Typography>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }} />

          {loading ? (
            <Typography>Loading...</Typography>
          ) : errorMsg ? (
            <Typography
              variant="body2"
              sx={{
                background: "rgba(0,0,0,0.2)",
                p: 1.2,
                borderRadius: 2,
              }}
            >
              {errorMsg}
            </Typography>
          ) : user ? (
            <Box sx={{ lineHeight: 2 }}>
              <Typography><b>Email:</b> {user.email}</Typography>
              <Typography><b>Firstname:</b> {user.firstName}</Typography>
              <Typography><b>Lastname:</b> {user.lastName}</Typography>
              <Typography><b>User Type:</b> {user.userType}</Typography>
              <Typography><b>Country:</b> {user.country}</Typography>
              <Typography><b>State/Province:</b> {user.stateProvince}</Typography>
              <Typography><b>City:</b> {user.city}</Typography>

              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }} />

              <Button
                fullWidth
                onClick={logout}
                sx={{
                  mt: 1,
                  py: 1.2,
                  fontWeight: 700,
                  backgroundColor: "#1e40af",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "#1d4ed8" },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Typography>No user found.</Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}