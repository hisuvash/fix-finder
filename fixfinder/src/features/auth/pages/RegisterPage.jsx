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

export default function RegisterPage({
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  userType,
  setUserType,
  password,
  setPassword,
  country,
  setCountry,
  stateProv,
  setStateProv,
  city,
  setCity,
  countries,
  statesForCountry,
  onRegister,
  onLoginRedirect,
}) {
  return (
    // 🔥 This outer Box becomes the scroll container
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        {/* Wrapper */}
        <Box
          sx={{
            display: "flex",
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
            {/* Title */}
            <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
              Create Your FixFinder Account
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ opacity: 0.9 }}
              mb={3}
            >
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
              onChange={(e) => setUserType(e.target.value)}
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
              helperText="Minimum 8 characters"
              InputLabelProps={{ style: { color: "#1e3a8a" } }}
              sx={{ backgroundColor: "white", borderRadius: 1 }}
            />

            {/* Country */}
            <TextField
              select
              label="Country"
              fullWidth
              margin="normal"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              InputLabelProps={{ style: { color: "#1e3a8a" } }}
              sx={{ backgroundColor: "white", borderRadius: 1 }}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            {/* State/Province */}
            <TextField
              select
              label="State / Province"
              fullWidth
              margin="normal"
              value={stateProv}
              onChange={(e) => setStateProv(e.target.value)}
              disabled={!country}
              helperText={!country ? "Select a country first" : ""}
              InputLabelProps={{ style: { color: "#1e3a8a" } }}
              sx={{ backgroundColor: "white", borderRadius: 1 }}
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
              onClick={onRegister}
              sx={{
                mt: 3,
                py: 1.3,
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

            <Typography variant="body2" align="center" sx={{ opacity: 0.95 }}>
              Already have an account?{" "}
              <Link
                component="button"
                underline="hover"
                sx={{ color: "#bfdbfe", fontWeight: 600 }}
                onClick={onLoginRedirect}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}