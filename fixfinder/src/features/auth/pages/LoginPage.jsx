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
    // TODO: call login API
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked for:", email);
    // TODO: route to forgot-password page or call API
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
        <Box
          sx={{
            width: "100%",
            p: 4,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {/* Title */}
          <Typography variant="h5" fontWeight={600} align="center" gutterBottom>
            Login
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            mb={2}
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
          />

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot password */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              underline="hover"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Login button */}
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleLogin}
          >
            Login
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* Optional footer */}
          <Typography variant="body2" align="center" color="text.secondary">
            Don’t have an account?{" "}
            <Link underline="hover" sx={{ cursor: "pointer" }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}