import { useState } from "react";

export function useLogin() {
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    try {
      console.log("Login pressed"); // API later
    } finally {
      setLoading(false);
    }
  }

  return { login, loading };
}