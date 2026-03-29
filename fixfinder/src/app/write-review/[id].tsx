import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../shared/config/api";
import { AppColors } from "../../shared/theme/colors";

export default function WriteReviewScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const revieweeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revieweeName, setRevieweeName] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!revieweeId || !token || !isLoggedIn) {
      if (!isLoggedIn) router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [userRes, eligRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${revieweeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/reviews/eligibility/${revieweeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const userData = await userRes.json().catch(() => ({}));
        const eligData = await eligRes.json().catch(() => ({}));

        if (userRes.ok && userData.user) {
          setRevieweeName(userData.user.fullName || "User");
        }
        if (eligRes.ok) {
          setCanReview(!!eligData.canReview);
          setEligibilityReason(eligData.reason || null);
        }
      } catch {
        setEligibilityReason("Could not load.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [revieweeId, token, isLoggedIn]);

  const submit = async () => {
    if (!revieweeId || !canReview) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          revieweeId,
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Alert.alert("Could not submit", data?.message || "Try again.");
        return;
      }
      // Inline success screen (Alert is unreliable on web and easy to miss on some native builds).
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.accent} />
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Review submitted</Text>
          <Text style={styles.successBody}>
            Thanks for sharing your feedback{revieweeName ? ` for ${revieweeName}` : ""}. It helps others on
            FixFinder.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace(`/user/${revieweeId}`)}
          >
            <Text style={styles.primaryBtnText}>View their profile</Text>
          </Pressable>
          <Pressable style={styles.secondarySuccessBtn} onPress={() => router.replace("/profile")}>
            <Text style={styles.secondarySuccessBtnText}>Back to my profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Write a review</Text>
      <Text style={styles.subtitle}>
        For <Text style={styles.bold}>{revieweeName || "this user"}</Text>
      </Text>

      {!canReview ? (
        <View style={styles.card}>
          <Text style={styles.blockText}>{eligibilityReason || "You cannot leave a review here."}</Text>
          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} style={styles.starHit}>
                <Text style={[styles.starChar, n <= rating ? styles.starOn : styles.starOff]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingHint}>{rating} out of 5</Text>

          <Text style={[styles.label, styles.labelSpaced]}>Your experience (optional)</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            placeholder="Share details that help others…"
            placeholderTextColor={AppColors.muted}
            value={comment}
            onChangeText={setComment}
            maxLength={2000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length} / 2000</Text>

          <Pressable
            style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            <Text style={styles.primaryBtnText}>{submitting ? "Submitting…" : "Submit review"}</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: AppColors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },
  muted: { marginTop: 8, color: AppColors.muted },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: AppColors.primaryText,
    marginBottom: 4,
  },
  subtitle: { fontSize: 16, color: AppColors.primaryText, marginBottom: 20 },
  bold: { fontWeight: "700" },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  blockText: { fontSize: 15, color: AppColors.primaryText, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: "600", color: AppColors.primaryText },
  labelSpaced: { marginTop: 20 },
  starsRow: { flexDirection: "row", marginTop: 8, gap: 4 },
  starHit: { padding: 4 },
  starChar: { fontSize: 36, lineHeight: 42 },
  starOn: { color: AppColors.star },
  starOff: { color: AppColors.starEmpty },
  ratingHint: { marginTop: 4, fontSize: 14, color: AppColors.muted },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    fontSize: 16,
    color: AppColors.primaryText,
  },
  charCount: { alignSelf: "flex-end", fontSize: 12, color: AppColors.muted, marginTop: 4 },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: AppColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelBtn: { marginTop: 12, alignItems: "center", padding: 8 },
  cancelText: { color: AppColors.primaryText, fontSize: 15 },
  secondaryBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    alignSelf: "flex-start",
  },
  secondaryBtnText: { color: AppColors.primaryText, fontWeight: "600" },
  successCard: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successIcon: {
    fontSize: 48,
    color: "#16a34a",
    fontWeight: "700",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.primaryText,
    marginBottom: 10,
    textAlign: "center",
  },
  successBody: {
    fontSize: 16,
    color: AppColors.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  secondarySuccessBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondarySuccessBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.accent,
  },
});
