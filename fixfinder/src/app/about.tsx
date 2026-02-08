import { View, Text } from "react-native";

export default function About() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>About</Text>
      <Text>About page</Text>
    </View>
  );
}