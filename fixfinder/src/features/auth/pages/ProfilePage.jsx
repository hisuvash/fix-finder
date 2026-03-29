import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";

export default function ProfilePage() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [pastHandymen, setPastHandymen] = useState([]);
  const [handymenLoading, setHandymenLoading] = useState(true);

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

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          router.replace("/login?redirect=/profile");
          return;
        }

        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        setUser(data.user);
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

  useEffect(() => {
    if (!token || !isLoggedIn) return;
    const fetchPastHandymen = async () => {
      try {
        setHandymenLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/users/past-handymen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.handymen)) {
          setPastHandymen(data.handymen);
        }
      } catch (e) {
        console.log("Past handymen fetch error:", e);
      } finally {
        setHandymenLoading(false);
      }
    };
    fetchPastHandymen();
  }, [token, isLoggedIn]);

  const handymenToShow = pastHandymen;

  const getImageUri = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    if (imagePath.startsWith("/")) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/${imagePath}`;
  };

  const leftContent = () => {
    if (authLoading || loading) {
      return (
        <View style={styles.centerColumn}>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>Loading...</Text>
        </View>
      );
    }
    if (errorMsg) {
      return (
        <View style={styles.centerColumn}>
          <Text style={styles.error}>{errorMsg}</Text>
        </View>
      );
    }
    if (!user) {
      return (
        <View style={styles.centerColumn}>
          <Text style={styles.text}>No user found.</Text>
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>User Profile</Text>

        <View style={styles.divider} />
        <View style={styles.myAvatarRow}>
          {getImageUri(user.profileImageUrl) ? (
            <Image source={{ uri: getImageUri(user.profileImageUrl) }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(user.firstName || user.email || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.row}><Text style={styles.bold}>Email: </Text>{user.email}</Text>
        <Text style={styles.row}><Text style={styles.bold}>Firstname: </Text>{user.firstName}</Text>
        <Text style={styles.row}><Text style={styles.bold}>Lastname: </Text>{user.lastName}</Text>
        <Text style={styles.row}><Text style={styles.bold}>User Type: </Text>{user.userType}</Text>
        <Text style={styles.row}><Text style={styles.bold}>Country: </Text>{user.country}</Text>
        <Text style={styles.row}><Text style={styles.bold}>State/Province: </Text>{user.stateProvince}</Text>
        <Text style={styles.row}><Text style={styles.bold}>City: </Text>{user.city}</Text>

        <Pressable style={styles.button} onPress={() => router.push("/edit-profile")}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.grid}>
      <View style={styles.gridLeft}>
        {leftContent()}
      </View>
      <View style={styles.gridRight}>
        <Text style={styles.sectionTitle}>Past Handymen you have worked with:</Text>
        {handymenLoading ? (
          <View style={styles.handymenLoading}>
            <ActivityIndicator size="small" />
          </View>
        ) : handymenToShow.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>You haven't worked with any handymen yet.</Text>
            <Text style={styles.emptyStateSubtext}>Handymen you work with will appear here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.tilesContainer} showsVerticalScrollIndicator={false}>
            {handymenToShow.map((handyman) => (
              <Pressable
                key={handyman.id}
                style={styles.handymanCard}
                onPress={() => router.push(`/user/${handyman.id}`)}
              >
                <View style={styles.avatarWrapper}>
                  {handyman.profileImageUrl ? (
                    <Image source={{ uri: handyman.profileImageUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {(handyman.fullName || "?").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.handymanName} numberOfLines={2}>
                  {handyman.fullName || "Handyman"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f7fb",
  },
  gridLeft: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#0000001c",
  },
  gridRight: {
    flex: 3,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263c91",
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#263c91",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
  },
  handymenLoading: {
    padding: 24,
    alignItems: "center",
  },
  tilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  handymanCard: {
    width: "31.5%",
    minWidth: 120,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrapper: {
    marginBottom: 8,
  },
  myAvatarRow: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#5063f9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  handymanName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#263c91",
    textAlign: "center",
  },
  centerColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    display: "flex",
    alignSelf: "flex-start",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#263c91", textAlign: "center", marginBottom: 4 },
  subtitle: { textAlign: "center", color: "#263c91", marginBottom: 12 },
  divider: { height: 1, backgroundColor: "#263c91", marginVertical: 12 },
  row: { color: "#263c91", marginBottom: 10, fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: "700" },
  text: { marginTop: 8, fontSize: 16 },
  error: { color: "red", marginTop: 8 },
  button: {
    marginTop: 18,
    backgroundColor: "#1e40af",
    paddingVertical: 12,
    backgroundColor: "#5063f9",
    padding: 16,
    paddingHorizontal: 24,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 3.6,
    color: "#fff",
    textTransform: "uppercase",
  },
  buttonText: { color: "white", fontWeight: "700", textAlign: "center", fontSize: 16 },
});
