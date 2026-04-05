import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import RegisterPage from "../features/auth/pages/RegisterPage";
import { API_BASE_URL } from "../shared/config/api";

type UserType = "Normal" | "Handyman";

const COUNTRY_STATE: Record<string, string[]> = {
  Canada: ["Ontario", "Quebec", "British Columbia", "Alberta"],
  USA: ["California", "Texas", "New York", "Florida"],
  Nepal: ["Bagmati", "Gandaki", "Koshi"],
};

export default function RegisterScreen() {
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const countries = useMemo(() => Object.keys(COUNTRY_STATE), []);
  const statesForCountry = useMemo(() => COUNTRY_STATE[country] || [], [country]);

  useEffect(() => {
    if (userType !== "Handyman") setSelectedSkills([]);
  }, [userType]);

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setStateProv("");
  };

  const validate = () => {
    if (!email.includes("@")) return "Invalid email";
    if (!firstName) return "Firstname required";
    if (!lastName) return "Lastname required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!country) return "Country required";
    if (!stateProv) return "State/Province required";
    if (!city) return "City required";
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) return "Phone required";
    if (digits.length < 10 || digits.length > 15) return "Valid phone (10–15 digits)";
    if (userType === "Handyman" && selectedSkills.length === 0) {
      return "Select at least one skill";
    }
    return null;
  };

  const handleRegister = async () => {
    setErrorMsg("");
    const error = validate();
    if (error) {
      setErrorMsg(error);
      return;
    }

    const payload: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      firstName,
      lastName,
      userType,
      password,
      country,
      stateProvince: stateProv,
      city,
      phone: phone.trim(),
    };
    if (userType === "Handyman") payload.skills = selectedSkills;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Registration failed");
      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed");
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
