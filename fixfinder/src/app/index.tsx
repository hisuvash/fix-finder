// import { Redirect } from "expo-router";

// export default function Index() {
//   return <Redirect href="/login" />;
// }

import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Home</Text>
      <Text>Home page contents go here page</Text>
    </View>
  );
}