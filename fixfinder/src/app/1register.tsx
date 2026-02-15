import { useMemo, useState } from "react";
import { router } from "expo-router";
import RegisterPage from "../features/auth/pages/RegisterPage";

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

  const countries = useMemo(() => Object.keys(COUNTRY_STATE), []);
  const statesForCountry = useMemo(
    () => COUNTRY_STATE[country] || [],
    [country]
  );

  const validate = () => {
    if (!email.includes("@")) return "Invalid email";
    if (!firstName) return "Firstname required";
    if (!lastName) return "Lastname required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!country) return "Country required";
    if (!stateProv) return "State/Province required";
    if (!city) return "City required";
    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    const payload = {
      email,
      firstName,
      lastName,
      userType,
      password, // send to backend (backend will hash + salt + JWT)
      country,
      stateProvince: stateProv,
      city,
    };

    console.log("Register Payload:", payload);

    try {
      // Example API call
      // const res = await fetch("http://localhost:5000/api/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message);

      // After successful registration
      router.push("/login");
    } catch (err: any) {
      alert(err.message || "Registration failed");
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
      setCountry={setCountry}
      stateProv={stateProv}
      setStateProv={setStateProv}
      city={city}
      setCity={setCity}
      countries={countries}
      statesForCountry={statesForCountry}
      onRegister={handleRegister}
      onLoginRedirect={() => router.push("/login")}
    />
  );
}