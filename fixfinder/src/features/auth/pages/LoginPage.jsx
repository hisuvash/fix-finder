import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Divider,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login clicked", { email, password });
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked for:", email);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* BLUE CARD */}
        <Box
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 3,
            backgroundColor: "#2563eb", // blue theme
            color: "white",
            boxShadow: "0px 12px 30px rgba(37, 99, 235, 0.35)",
          }}
        >
          {/* Title */}
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
            Welcome To FixFinder
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ opacity: 0.85 }}
            mb={3}
          >
            Sign in to your account
          </Typography>

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
            }}
          />

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
            }}
          />

          {/* Forgot password */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              underline="hover"
              sx={{ color: "#dbeafe" }}
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Login button */}
          <Button
            fullWidth
            onClick={handleLogin}
            sx={{
              mt: 3,
              py: 1.2,
              fontWeight: 700,
              backgroundColor: "#1e40af",
              color: "white",
              borderRadius: 2,
              boxShadow: "0px 6px 16px rgba(30, 64, 175, 0.45)",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            Login
          </Button>

          <Divider
            sx={{
              my: 3,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          />

          {/* Footer */}
          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            Don’t have an account?{" "}
            <Link underline="hover" sx={{ color: "#bfdbfe", fontWeight: 600 }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}