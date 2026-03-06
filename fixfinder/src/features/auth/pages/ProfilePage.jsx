import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";

export default function ProfilePage() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [handyManInfoExists, setHandyManInfoExists] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      router.replace("/login?redirect=/profile");
      return;
    }

    const loadMe = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // ✅ Use the new endpoint that includes handyManInfoExists
        const res = await fetch(`${API_BASE_URL}/api/auth/me-with-handyman`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          router.replace("/login?redirect=/profile");
          return;
        }

        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        setUser(data.user);
        setHandyManInfoExists(!!data.handyManInfoExists);
      } catch (e) {
        console.log("PROFILE LOAD ERROR:", e);
        setErrorMsg(e?.message || "Failed to load profile");
        Alert.alert("Profile Error", e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [authLoading, isLoggedIn, token]);

  if (authLoading || loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const isHandyman = user?.userType === "Handyman";

  return (
    <View style={styles.centerScreen}>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : user ? (
        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>User Profile</Text>

          <View style={styles.divider} />

          <Text style={styles.row}><Text style={styles.bold}>Email: </Text>{user.email}</Text>
          <Text style={styles.row}><Text style={styles.bold}>Firstname: </Text>{user.firstName}</Text>
          <Text style={styles.row}><Text style={styles.bold}>Lastname: </Text>{user.lastName}</Text>
          <Text style={styles.row}><Text style={styles.bold}>User Type: </Text>{user.userType}</Text>
          <Text style={styles.row}><Text style={styles.bold}>Country: </Text>{user.country}</Text>
          <Text style={styles.row}><Text style={styles.bold}>State/Province: </Text>{user.stateProvince}</Text>
          <Text style={styles.row}><Text style={styles.bold}>City: </Text>{user.city}</Text>

          {/* ✅ Handyman: Add/Edit Skills button */}
          {isHandyman ? (
            !handyManInfoExists ? (
              <Pressable
                style={[styles.button, styles.skillsButton]}
                onPress={() => router.push("/add-skills")}
              >
                <Text style={styles.buttonText}>Add Skills</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, styles.skillsButton]}
                onPress={() => router.push("/edit-skills")}
              >
                <Text style={styles.buttonText}>Edit Skills</Text>
              </Pressable>
            )
          ) : null}

          {/* ✅ Edit Profile button (same as your working code) */}
          <Pressable style={styles.button} onPress={() => router.push("/edit-profile")}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </Pressable>

          {/* ✅ List Handyman button - only for non-handymen */}
          {!isHandyman && (
            <Pressable style={[styles.button, styles.listButton]} onPress={() => router.push("/list-handymen")}>
              <Text style={styles.buttonText}>List Handymen</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Text style={styles.text}>No user found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: "700", color: "white", textAlign: "center", marginBottom: 4 },
  subtitle: { textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: 12 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.3)", marginVertical: 12 },
  row: { color: "white", marginBottom: 10, fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: "700" },
  text: { marginTop: 8, fontSize: 16 },
  error: { color: "red", marginTop: 8 },
  button: {
    marginTop: 18,
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    borderRadius: 12,
  },
  // ✅ Slightly different color for skills button (optional)
  skillsButton: {
    backgroundColor: "#0f766e",
    marginTop: 12,
  },
  listButton: {
    backgroundColor: "#7c3aed",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "700", textAlign: "center", fontSize: 16 },
});