import { Platform } from "react-native";

/** Set in production builds, e.g. Vercel: EXPO_PUBLIC_API_URL=https://your-api.onrender.com */
const fromEnv =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  (typeof process !== "undefined" && process.env?.API_BASE_URL) ||
  "";

const maybeWindowHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const maybeWindowProtocol = typeof window !== "undefined" ? window.location.protocol : "http:";

export const API_BASE_URL =
  fromEnv ||
  (Platform.OS === "web"
    ? `${maybeWindowProtocol}//${maybeWindowHost}:5001`
    : Platform.OS === "android"
      ? "http://10.0.2.2:5001"
      : "http://localhost:5001");