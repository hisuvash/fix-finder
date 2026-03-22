// app/register.tsx
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import RegisterPage from "../features/auth/pages/RegisterPage";

type UserType = "Normal" | "Handyman";

const COUNTRY_STATE: Record<string, string[]> = {
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia"],
  USA: ["California", "New York", "Texas", "Florida", "Washington"],
  Nepal: ["Bagmati", "Gandaki", "Koshi", "Lumbini", "Madhesh", "Karnali", "Sudurpashchim"],
};

// ✅ Change this:
// - Web dev: "http://localhost:5000"
// - Android emulator: "http://10.0.2.2:5000"
// - iOS simulator: "http://localhost:5000"
// - Physical phone: "http://YOUR_LAPTOP_IP:5000" (same Wi-Fi)
const API_BASE_URL = "http://localhost:5001";

export default function RegisterScreen() {
  // form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<UserType>("Normal");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Canada");
  const [stateProv, setStateProv] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const countries = useMemo(() => Object.keys(COUNTRY_STATE), []);
  const statesForCountry = useMemo(() => COUNTRY_STATE[country] ?? [], [country]);

  useEffect(() => {
    if (userType !== "Handyman") {
      setSelectedSkills([]);
    }
  }, [userType]);

  // keep state/province valid when country changes
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setStateProv("");
  };

  const validate = (): string | null => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) return "Please enter a valid email.";
    if (!firstName.trim()) return "Firstname is required.";
    if (!lastName.trim()) return "Lastname is required.";
    if (!password || password.length < 8) return "Password must be at least 8 characters.";
    if (!country) return "Country is required.";
    if (!stateProv) return "State/Province is required.";
    if (!city.trim()) return "City is required.";
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) return "Phone number is required.";
    if (digits.length < 10 || digits.length > 15) {
      return "Enter a valid phone number (10–15 digits).";
    }
    if (userType === "Handyman" && selectedSkills.length === 0) {
      return "Please select at least one skill for your handyman profile.";
    }
    return null;
  };

  const handleRegister = async () => {
    setErrorMsg("");
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    const payload: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      userType,
      password,
      country,
      stateProvince: stateProv,
      city: city.trim(),
      phone: phone.trim(),
    };
    if (userType === "Handyman") {
      payload.skills = selectedSkills;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.message || `Registration failed (${res.status})`);
      }

      console.log("✅ Registered. JWT:", data.token);
      console.log("✅ User:", data.user);

      router.push("/login");
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterPage
      email={email}
      setEmail={setEmail}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      userType={userType}
      setUserType={setUserType}
      password={password}
      setPassword={setPassword}
      country={country}
      setCountry={handleCountryChange}
      stateProv={stateProv}
      setStateProv={setStateProv}
      city={city}
      setCity={setCity}
      phone={phone}
      setPhone={setPhone}
      countries={countries}
      statesForCountry={statesForCountry}
      onRegister={handleRegister}
      onLoginRedirect={() => router.push("/login")}
      selectedSkills={selectedSkills}
      setSelectedSkills={setSelectedSkills}
      errorMsg={errorMsg}
      loading={loading}
    />
  );
}
