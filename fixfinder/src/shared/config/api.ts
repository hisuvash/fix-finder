import { Platform } from "react-native";

const maybeWindowHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const maybeWindowProtocol = typeof window !== "undefined" ? window.location.protocol : "http:";

export const API_BASE_URL =
  process.env.API_BASE_URL ||
  (Platform.OS === "web"
    ? `${maybeWindowProtocol}//${maybeWindowHost}:5001`
    : Platform.OS === "android"
    ? "http://10.0.2.2:5001"
    : "http://localhost:5001"); // iOS simulator/device (or fallback)