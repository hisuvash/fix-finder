import { View, TextInput, Button } from "react-native";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const { login, loading } = useLogin();

  return (
    <View style={{ gap: 14 }}>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={input}
      />

      <Button
        title={loading ? "Signing in..." : "Sign in"}
        onPress={login}
        disabled={loading}
      />
    </View>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#e5e7eb",
  padding: 12,
  borderRadius: 10,
};