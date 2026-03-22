import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { HANDYMAN_SKILL_OPTIONS } from "../../../shared/constants/handymanSkills";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1,
    "& fieldset": { borderColor: "#263c91" },
    "&:hover fieldset": { borderColor: "#5063f9" },
    "&.Mui-focused fieldset": { borderColor: "#5063f9", borderWidth: 2 },
  },
};

const selectFormSx = {
  ...fieldSx,
  "& .MuiInputLabel-root": { color: "#263c91" },
};

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
  phone,
  setPhone,
  countries,
  statesForCountry,
  onRegister,
  onLoginRedirect,
  selectedSkills = [],
  setSelectedSkills,
  errorMsg = "",
  loading = false,
}) {
  const handleSkillsChange = (e) => {
    const v = e.target.value;
    setSelectedSkills(typeof v === "string" ? v.split(",") : v);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              p: 4,
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              align="center"
              gutterBottom
              sx={{ color: "#263c91" }}
            >
              Create Your FixFinder Account
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "#263c91", opacity: 0.9 }}
              mb={2}
            >
              Sign up to get started
            </Typography>

            {errorMsg ? (
              <Typography
                sx={{
                  background: "rgba(220, 38, 38, 0.1)",
                  color: "#b91c1c",
                  p: 1.2,
                  borderRadius: 2,
                  mb: 1,
                  fontSize: 14,
                }}
              >
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
              sx={fieldSx}
            />

            <TextField
              label="Firstname"
              fullWidth
              margin="normal"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            />

            <TextField
              label="Lastname"
              fullWidth
              margin="normal"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            />

            <TextField
              label="Phone number"
              type="tel"
              fullWidth
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Required — 10–15 digits (country code OK)"
              FormHelperTextProps={{ sx: { color: "#263c91", opacity: 0.75 } }}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            />

            <TextField
              select
              label="User Type"
              fullWidth
              margin="normal"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            >
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Handyman">Handyman</MenuItem>
            </TextField>

            {userType === "Handyman" && setSelectedSkills ? (
              <FormControl fullWidth margin="normal" sx={selectFormSx}>
                <InputLabel id="register-skills-label" sx={{ color: "#263c91" }}>
                  Skills
                </InputLabel>
                <Select
                  labelId="register-skills-label"
                  multiple
                  value={selectedSkills}
                  onChange={handleSkillsChange}
                  input={<OutlinedInput label="Skills" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((s) => (
                        <Chip key={s} label={s} size="small" sx={{ bgcolor: "rgba(80, 99, 249, 0.12)", color: "#263c91" }} />
                      ))}
                    </Box>
                  )}
                  MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                >
                  {HANDYMAN_SKILL_OPTIONS.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      <Checkbox checked={selectedSkills.indexOf(skill) > -1} sx={{ color: "#263c91", "&.Mui-checked": { color: "#5063f9" } }} />
                      <ListItemText primary={skill} primaryTypographyProps={{ sx: { color: "#263c91" } }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 8 characters"
              FormHelperTextProps={{ sx: { color: "#263c91", opacity: 0.75 } }}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            />

            <TextField
              select
              label="Country"
              fullWidth
              margin="normal"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="State / Province"
              fullWidth
              margin="normal"
              value={stateProv}
              onChange={(e) => setStateProv(e.target.value)}
              disabled={!country}
              helperText={!country ? "Select a country first" : ""}
              FormHelperTextProps={{ sx: { color: "#263c91", opacity: 0.75 } }}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            >
              {statesForCountry.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="City"
              fullWidth
              margin="normal"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              InputLabelProps={{ style: { color: "#263c91" } }}
              sx={fieldSx}
            />

            <Button
              fullWidth
              disabled={loading}
              onClick={onRegister}
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
              {loading ? "Signing up..." : "Sign up"}
            </Button>

            <Divider sx={{ my: 3, borderColor: "#263c91", opacity: 0.3 }} />

            <Typography variant="body2" align="center" sx={{ color: "#263c91" }}>
              Already have an account?{" "}
              <Link
                component="button"
                type="button"
                underline="hover"
                sx={{
                  color: "#5063f9",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                }}
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
