import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../shared/auth/AuthContext";
import { API_BASE_URL } from "../shared/config/api";
import { AppColors } from "../shared/theme/colors";

type Incoming = {
  id: string;
  status: string;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    city: string;
    stateProvince: string;
    country: string;
  } | null;
};

export default function ConnectionRequestsScreen() {
  const { token, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<Incoming[]>([]);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/connections/incoming`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setRequests(data.requests || []);
  }, [token]);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      router.replace("/login");
      return;
    }
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [isLoggedIn, token, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const accept = async (requestId: string) => {
    if (!token) return;
    try {
      setActingId(requestId);
      const res = await fetch(`${API_BASE_URL}/api/connections/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Error", data?.message || "Could not accept.");
        return;
      }
      Alert.alert("Accepted", "You are now connected. They can leave you a review.");
      await load();
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (requestId: string) => {
    if (!token) return;
    try {
      setActingId(requestId);
      const res = await fetch(`${API_BASE_URL}/api/connections/${requestId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Error", data?.message || "Could not decline.");
        return;
      }
      await load();
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.accent} />
        <Text style={styles.muted}>Loading requests…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Connection requests</Text>
      <Text style={styles.sub}>Clients who want to connect with you. Accept to add them to your past clients.</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>No pending requests.</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.name}>{r.client?.fullName || "Client"}</Text>
            <Text style={styles.meta}>{r.client?.email}</Text>
            {r.client?.phone ? (
              <Pressable
                onPress={() => {
                  const tel = `tel:${r.client!.phone!.replace(/\D/g, "")}`;
                  Linking.openURL(tel).catch(() => {});
                }}
              >
                <Text style={styles.phoneLink}>Phone: {r.client.phone}</Text>
              </Pressable>
            ) : null}
            <Text style={styles.meta}>
              {[r.client?.city, r.client?.stateProvince, r.client?.country].filter(Boolean).join(", ")}
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={[styles.accept, actingId === r.id && styles.disabled]}
                disabled={actingId === r.id}
                onPress={() => accept(r.id)}
              >
                <Text style={styles.acceptText}>{actingId === r.id ? "…" : "Accept"}</Text>
              </Pressable>
              <Pressable
                style={[styles.reject, actingId === r.id && styles.disabled]}
                disabled={actingId === r.id}
                onPress={() => reject(r.id)}
              >
                <Text style={styles.rejectText}>Decline</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => r.client && router.push(`/user/${r.client.id}`)}>
              <Text style={styles.view}>View client profile</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: AppColors.background },
  muted: { marginTop: 8, color: AppColors.muted },
  title: { fontSize: 22, fontWeight: "700", color: AppColors.primaryText, marginBottom: 8 },
  sub: { fontSize: 14, color: AppColors.muted, marginBottom: 20, lineHeight: 20 },
  empty: { fontSize: 15, color: AppColors.muted },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  name: { fontSize: 17, fontWeight: "700", color: AppColors.primaryText },
  meta: { fontSize: 14, color: AppColors.muted, marginTop: 4 },
  phoneLink: { fontSize: 14, color: AppColors.accent, fontWeight: "600", marginTop: 6 },
  actions: { flexDirection: "row", gap: 12, marginTop: 14 },
  accept: {
    flex: 1,
    backgroundColor: AppColors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "700" },
  reject: {
    flex: 1,
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectText: { color: AppColors.primaryText, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  view: { marginTop: 12, color: AppColors.accent, fontWeight: "600", fontSize: 14 },
});
