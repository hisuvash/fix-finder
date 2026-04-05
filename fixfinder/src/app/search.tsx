import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../shared/auth/AuthContext";
import { API_BASE_URL } from "../shared/config/api";
import { AppColors } from "../shared/theme/colors";
import { HANDYMAN_SKILL_OPTIONS } from "../shared/constants/handymanSkills";

type HandymanRow = {
  id: string;
  fullName: string;
  city: string;
  stateProvince: string;
  country: string;
  profileImageUrl: string | null;
  skills: string[];
};

export default function SearchScreen() {
  const { token, isLoggedIn } = useAuth();
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [country, setCountry] = useState("");
  const [skill, setSkill] = useState("");
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HandymanRow[]>([]);
  const [sentMap, setSentMap] = useState<Record<string, string>>({});
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const loadSent = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/connections/sent`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const map: Record<string, string> = {};
    (data.requests || []).forEach((r: { handyman?: { id: string }; status: string }) => {
      if (r.handyman?.id) map[r.handyman.id] = r.status;
    });
    setSentMap(map);
  }, [token]);

  React.useEffect(() => {
    if (isLoggedIn && token) loadSent();
  }, [isLoggedIn, token, loadSent]);

  const search = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (city.trim()) q.set("city", city.trim());
      if (stateProvince.trim()) q.set("stateProvince", stateProvince.trim());
      if (country.trim()) q.set("country", country.trim());
      if (skill.trim()) q.set("skill", skill.trim());
      const res = await fetch(`${API_BASE_URL}/api/users/search/handymen?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        Alert.alert("Not available", "Only client accounts can search handymen.");
        return;
      }
      if (!res.ok) {
        Alert.alert("Search failed", data?.message || "Try again.");
        return;
      }
      setResults(data.handymen || []);
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (handymanId: string) => {
    if (!token) return;
    try {
      setRequestingId(handymanId);
      const res = await fetch(`${API_BASE_URL}/api/connections/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handymanId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Could not send", data?.message || "Try again.");
        return;
      }
      setSentMap((m) => ({ ...m, [handymanId]: "pending" }));
      Alert.alert("Sent", "Connection request sent. You can review them after they accept.");
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setRequestingId(null);
    }
  };

  const statusLabel = (id: string) => {
    const s = sentMap[id];
    if (!s) return null;
    if (s === "pending") return "Request pending";
    if (s === "accepted") return "Connected";
    if (s === "rejected") return "Declined — you can send again";
    return s;
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find handymen</Text>
      <Text style={styles.sub}>
        Filter by location and skill. Send a connection request; once they accept, they appear on your
        profile and you can leave a review.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Skill</Text>
        <Pressable
          style={styles.selectTrigger}
          onPress={() => setSkillPickerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose skill filter"
        >
          <Text style={[styles.selectTriggerText, !skill && styles.selectPlaceholder]}>
            {skill || "Any skill (optional)"}
          </Text>
          <Text style={styles.selectChevron}>▼</Text>
        </Pressable>

        <Modal
          visible={skillPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSkillPickerOpen(false)}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSkillPickerOpen(false)} />
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Filter by skill</Text>
              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Pressable
                  style={styles.modalRow}
                  onPress={() => {
                    setSkill("");
                    setSkillPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalRowTextMuted}>Any skill (no filter)</Text>
                </Pressable>
                {HANDYMAN_SKILL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[styles.modalRow, skill === opt && styles.modalRowSelected]}
                    onPress={() => {
                      setSkill(opt);
                      setSkillPickerOpen(false);
                    }}
                  >
                    <Text style={[styles.modalRowText, skill === opt && styles.modalRowTextSelected]}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable style={styles.modalCloseBtn} onPress={() => setSkillPickerOpen(false)}>
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={AppColors.muted}
          value={city}
          onChangeText={setCity}
        />
        <Text style={styles.label}>State / province</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={AppColors.muted}
          value={stateProvince}
          onChangeText={setStateProvince}
        />
        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={AppColors.muted}
          value={country}
          onChangeText={setCountry}
        />
        <Pressable style={styles.btn} onPress={search} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Search</Text>
          )}
        </Pressable>
      </View>

      {results.map((h) => (
        <View key={h.id} style={styles.resultCard}>
          <Text style={styles.name}>{h.fullName}</Text>
          <Text style={styles.meta}>
            {[h.city, h.stateProvince, h.country].filter(Boolean).join(", ")}
          </Text>
          {h.skills?.length ? (
            <Text style={styles.skills}>Skills: {h.skills.join(", ")}</Text>
          ) : null}
          {statusLabel(h.id) ? <Text style={styles.status}>{statusLabel(h.id)}</Text> : null}
          <View style={styles.row}>
            <Pressable style={styles.linkBtn} onPress={() => router.push(`/user/${h.id}`)}>
              <Text style={styles.linkText}>View profile</Text>
            </Pressable>
            {sentMap[h.id] === "accepted" ? null : (
              <Pressable
                style={[styles.linkBtn, styles.primaryOutline]}
                onPress={() => sendRequest(h.id)}
                disabled={requestingId === h.id || sentMap[h.id] === "pending"}
              >
                <Text style={styles.primaryOutlineText}>
                  {requestingId === h.id
                    ? "Sending…"
                    : sentMap[h.id] === "pending"
                      ? "Pending"
                      : sentMap[h.id] === "rejected"
                        ? "Send again"
                        : "Request connection"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      {!loading && results.length === 0 ? (
        <Text style={styles.hint}>Use Search with at least one filter, or leave all empty to list handymen (up to 50).</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", color: AppColors.primaryText, marginBottom: 8 },
  sub: { fontSize: 14, color: AppColors.muted, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: "600", color: AppColors.primaryText, marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: AppColors.primaryText,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: AppColors.card,
  },
  selectTriggerText: { fontSize: 16, color: AppColors.primaryText, flex: 1, paddingRight: 8 },
  selectPlaceholder: { color: AppColors.muted },
  selectChevron: { fontSize: 10, color: AppColors.muted },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    backgroundColor: AppColors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "72%",
    paddingBottom: 24,
    paddingTop: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: AppColors.primaryText,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.muted,
  },
  modalScroll: { maxHeight: 400 },
  modalRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  modalRowSelected: { backgroundColor: "rgba(80, 99, 249, 0.12)" },
  modalRowText: { fontSize: 16, color: AppColors.primaryText },
  modalRowTextSelected: { fontWeight: "600", color: AppColors.accent },
  modalRowTextMuted: { fontSize: 16, color: AppColors.muted },
  modalCloseBtn: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.primaryText,
  },
  modalCloseBtnText: { fontWeight: "600", color: AppColors.primaryText },
  btn: {
    backgroundColor: AppColors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resultCard: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  name: { fontSize: 17, fontWeight: "700", color: AppColors.primaryText },
  meta: { fontSize: 14, color: AppColors.muted, marginTop: 4 },
  skills: { fontSize: 13, color: AppColors.primaryText, marginTop: 6 },
  status: { fontSize: 13, fontWeight: "600", color: AppColors.accent, marginTop: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  linkBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  linkText: { color: AppColors.accent, fontWeight: "600", fontSize: 14 },
  primaryOutline: {
    borderWidth: 1,
    borderColor: AppColors.accent,
    borderRadius: 8,
  },
  primaryOutlineText: { color: AppColors.accent, fontWeight: "600", fontSize: 14 },
  hint: { fontSize: 13, color: AppColors.muted, marginTop: 8 },
});
