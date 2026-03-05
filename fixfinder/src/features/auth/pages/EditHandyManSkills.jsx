import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../../shared/config/api";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Alert, ScrollView } from "react-native";

export default function EditSkillsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skill: "",
    ratePerHour: "",
    distanceKm: "",
    experienceYears: "",
    license: "",
    certifications: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setMsg("");
        console.log("Checking handyman skills if exists...");
        const res = await fetch(`${API_BASE_URL}/api/handyman-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load skills.");
        if (!data?.info) throw new Error("No skills found. Please add skills first.");

        const i = data.info;

        setForm({
          name: i.name || "",
          email: i.email || "",
          phone: i.phone || "",
          skill: i.skill || "",
          ratePerHour: String(i.ratePerHour ?? ""),
          distanceKm: String(i.distanceKm ?? ""),
          experienceYears: String(i.experienceYears ?? ""),
          license: i.license || "",
          certifications: i.certifications || "",
        });
      } catch (e) {
        setMsg(e?.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (token) load();
  }, [token]);

  const setField = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const onSave = async () => {
    setMsg("");

    if (!form.name.trim() || !form.skill.trim()) {
      setMsg("Name and skill are required.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE_URL}/api/handyman-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          // email + phone intentionally not sent / not updatable
          skill: form.skill,
          ratePerHour: Number(form.ratePerHour || 0),
          distanceKm: Number(form.distanceKm || 0),
          experienceYears: Number(form.experienceYears || 0),
          license: form.license,
          certifications: form.certifications,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Update failed.");

      setMsg("Updated successfully!");
      setTimeout(() => router.replace("/profile"), 600);
    } catch (e) {
      setMsg(e?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Edit Professional Skills</Text>

        {msg ? <Text style={styles.msg}>{msg}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={setField("name")}
        />
        <TextInput
          style={[styles.input, styles.disabled]}
          placeholder="Email"
          value={form.email}
          editable={false}
        />
        <TextInput
          style={[styles.input, styles.disabled]}
          placeholder="Phone"
          value={form.phone}
          editable={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Skill"
          value={form.skill}
          onChangeText={setField("skill")}
        />
        <TextInput
          style={styles.input}
          placeholder="Rate / hr"
          keyboardType="numeric"
          value={form.ratePerHour}
          onChangeText={setField("ratePerHour")}
        />
        <TextInput
          style={styles.input}
          placeholder="Distance willing to work (km)"
          keyboardType="numeric"
          value={form.distanceKm}
          onChangeText={setField("distanceKm")}
        />
        <TextInput
          style={styles.input}
          placeholder="Experience (years)"
          keyboardType="numeric"
          value={form.experienceYears}
          onChangeText={setField("experienceYears")}
        />

        <TextInput
          style={styles.input}
          placeholder="License"
          value={form.license}
          onChangeText={setField("license")}
        />
        <TextInput
          style={styles.input}
          placeholder="Certifications"
          value={form.certifications}
          onChangeText={setField("certifications")}
        />

        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.saveButton]} disabled={saving} onPress={onSave}>
            <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  inner: {
    padding: 20,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2563eb",
  },
  msg: {
    marginBottom: 20,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  disabled: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});