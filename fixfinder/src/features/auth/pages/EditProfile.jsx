import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";

export default function EditProfile() {
  const { token, isLoggedIn, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState("");
  const [country, setCountry] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn || !token) {
      router.replace("/login?redirect=/edit-profile");
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
          router.replace("/login?redirect=/edit-profile");
          return;
        }

        if (!res.ok) throw new Error(data?.message || "Failed to load profile");

        const u = data.user;
        setEmail(u.email || "");
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setUserType(u.userType || "");
        setCountry(u.country || "");
        setStateProvince(u.stateProvince || "");
        setCity(u.city || "");
        setPhone(u.phone || "");
      } catch (e) {
        console.log("EDIT LOAD ERROR:", e);
        setErrorMsg(e?.message || "Failed to load profile");
        Alert.alert("Error", e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [authLoading, isLoggedIn, token]);

  const onSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");

      // basic validation
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("Firstname and lastname are required.");
      }
      if (!country.trim() || !stateProvince.trim() || !city.trim()) {
        throw new Error("Country, state/province, and city are required.");
      }
      const digits = phone.replace(/\D/g, "");
      if (!phone.trim()) throw new Error("Phone number is required.");
      if (digits.length < 10 || digits.length > 15) {
        throw new Error("Enter a valid phone number (10–15 digits).");
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          userType: userType.trim(),
          country: country.trim(),
          stateProvince: stateProvince.trim(),
          city: city.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.replace("/login?redirect=/edit-profile");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Update failed");

      Alert.alert("Success", "Profile updated ✅");
      router.replace("/profile");
    } catch (e) {
      console.log("SAVE ERROR:", e);
      setErrorMsg(e?.message || "Update failed");
      Alert.alert("Update Error", e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.centerScreen}>
      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your details</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <Text style={styles.label}>Email (read-only)</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />

        <Text style={styles.label}>Firstname</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Lastname</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>User Type</Text>
        <TextInput style={styles.input} value={userType} onChangeText={setUserType} />

        <Text style={styles.label}>Country</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />

        <Text style={styles.label}>State/Province</Text>
        <TextInput style={styles.input} value={stateProvince} onChangeText={setStateProvince} />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="10–15 digits"
        />

        <Pressable style={styles.saveBtn} onPress={onSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
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
    backgroundColor: "white",
    width: "90%",
    maxWidth: 480,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 4, color: "#111827" },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: 12 },
  label: { marginTop: 10, marginBottom: 6, fontWeight: "700", color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  error: { color: "red", marginTop: 8, textAlign: "center" },
  saveBtn: { marginTop: 18, backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 12 },
  saveText: { color: "white", fontWeight: "800", textAlign: "center", fontSize: 16 },
  cancelBtn: { marginTop: 10, paddingVertical: 10, borderRadius: 12 },
  cancelText: { textAlign: "center", fontWeight: "700", color: "#2563eb" },
  text: { marginTop: 8, fontSize: 16 },
});