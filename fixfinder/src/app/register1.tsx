import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Divider,
  MenuItem,
} from "@mui/material";

type UserType = "Normal" | "Handyman";

const COUNTRY_STATE: Record<string, string[]> = {
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia"],
  USA: ["California", "New York", "Texas", "Florida", "Washington"],
  Nepal: ["Bagmati", "Gandaki", "Koshi", "Lumbini", "Madhesh", "Karnali", "Sudurpashchim"],
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<UserType>("Normal");
  const [password, setPassword] = useState("");

  const [country, setCountry] = useState<string>("Canada");
  const [stateProv, setStateProv] = useState<string>("");
  const [city, setCity] = useState("");

  const countries = useMemo(() => Object.keys(COUNTRY_STATE), []);
  const statesForCountry = useMemo(() => COUNTRY_STATE[country] ?? [], [country]);

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setStateProv(""); // reset dependent dropdown
  };

  const validate = () => {
    const e = email.trim();
    if (!e || !e.includes("@")) return "Please enter a valid email.";
    if (!firstName.trim()) return "Firstname is required.";
    if (!lastName.trim()) return "Lastname is required.";
    if (!password || password.length < 8) return "Password must be at least 8 characters.";
    if (!country) return "Country is required.";
    if (!stateProv) return "State/Province is required.";
    if (!city.trim()) return "City is required.";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const payload = {
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userType,
      password, // send to backend via HTTPS; backend hashes+salts it and returns JWT
      country,
      stateProvince: stateProv,
      city: city.trim(),
    };

    console.log("Register clicked", payload);

    // TODO: call your backend endpoint here (example)
    // const res = await fetch("https://YOUR_API/auth/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });
    // const data = await res.json();
    // if (!res.ok) throw new Error(data?.message ?? "Registration failed");
    // store token returned by backend (JWT), then navigate:
    // router.replace("/");

    router.push("/login"); // or router.back()
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
            backgroundColor: "#2563eb",
            color: "white",
            boxShadow: "0px 12px 30px rgba(37, 99, 235, 0.35)",
          }}
        >
          <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
            Create Your FixFinder Account
          </Typography>

          <Typography variant="body2" align="center" sx={{ opacity: 0.85 }} mb={3}>
            Sign up to get started
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
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          {/* Firstname */}
          <TextField
            label="Firstname"
            fullWidth
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          {/* Lastname */}
          <TextField
            label="Lastname"
            fullWidth
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          {/* User Type */}
          <TextField
            select
            label="User Type"
            fullWidth
            margin="normal"
            value={userType}
            onChange={(e) => setUserType(e.target.value as UserType)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          >
            <MenuItem value="Normal">Normal</MenuItem>
            <MenuItem value="Handyman">Handyman</MenuItem>
          </TextField>

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            helperText="Minimum 8 characters"
          />

          {/* Country */}
          <TextField
            select
            label="Country"
            fullWidth
            margin="normal"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          >
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          {/* State/Province (dependent) */}
          <TextField
            select
            label="State/Province"
            fullWidth
            margin="normal"
            value={stateProv}
            onChange={(e) => setStateProv(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            disabled={!country}
            helperText={!country ? "Select a country first" : ""}
          >
            {statesForCountry.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          {/* City */}
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            InputLabelProps={{ style: { color: "#1e3a8a" } }}
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />

          {/* Register button */}
          <Button
            fullWidth
            onClick={handleRegister}
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
            Sign Up
          </Button>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.3)" }} />

          <Typography variant="body2" align="center" sx={{ opacity: 0.9 }}>
            Already have an account?{" "}
            <Link
              underline="hover"
              sx={{ color: "#bfdbfe", fontWeight: 600 }}
              onClick={() => router.push("/login")}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}