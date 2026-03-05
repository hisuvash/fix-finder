import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";

export default function ListHandymenPage() {
  const { token } = useAuth();

  const [handymen, setHandymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/handyman-info/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load handymen.");

        setHandymen(data.handymen || []);
      } catch (e) {
        setError(e?.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
  }, [token]);

  const handleMessage = (handyman) => {
    Alert.alert("Message", `Messaging ${handyman.name}... (Feature not implemented yet)`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading handymen...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Handymen</Text>
      {handymen.length === 0 ? (
        <Text style={styles.noData}>No handymen found.</Text>
      ) : (
        <FlatList
          data={handymen}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
              <Text style={[styles.cell, styles.skillCell]}>{item.skill}</Text>
              <Text style={[styles.cell, styles.rateCell]}>${item.ratePerHour}/hr</Text>
              <Text style={[styles.cell, styles.distanceCell]}>{item.distanceKm} km</Text>
              <Text style={[styles.cell, styles.experienceCell]}>{item.experienceYears} yrs</Text>
              <Pressable style={styles.messageButton} onPress={() => handleMessage(item)}>
                <Text style={styles.messageText}>Message</Text>
              </Pressable>
            </View>
          )}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={[styles.headerCell, styles.nameCell]}>Name</Text>
              <Text style={[styles.headerCell, styles.skillCell]}>Skill</Text>
              <Text style={[styles.headerCell, styles.rateCell]}>Rate</Text>
              <Text style={[styles.headerCell, styles.distanceCell]}>Distance</Text>
              <Text style={[styles.headerCell, styles.experienceCell]}>Experience</Text>
              <Text style={[styles.headerCell, styles.messageCell]}>Action</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2563eb",
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  headerCell: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
    alignItems: "center",
  },
  cell: {
    fontSize: 14,
    textAlign: "center",
  },
  nameCell: {
    flex: 2,
  },
  skillCell: {
    flex: 2,
  },
  rateCell: {
    flex: 1,
  },
  distanceCell: {
    flex: 1,
  },
  experienceCell: {
    flex: 1,
  },
  messageCell: {
    flex: 1,
  },
  messageButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  messageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});