import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../shared/auth/AuthContext";
import { API_BASE_URL } from "../../shared/config/api";
import { AppColors } from "../../shared/theme/colors";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id?: string;
    fullName: string;
    profileImageUrl: string | null;
    userType?: string;
  };
};

function StarRow({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <View style={styles.starRowInline}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text
          key={n}
          style={{
            fontSize: size,
            color: n <= Math.round(value) ? AppColors.star : AppColors.starEmpty,
          }}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export default function UserProfilePage() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token, isLoggedIn } = useAuth();
  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    userType: string;
    country: string;
    stateProvince: string;
    city: string;
    profileImageUrl: string | null;
    skills?: string[];
    phone?: string;
    reviewSummary?: { avgRating: number | null; count: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<{ avgRating: number | null; count: number }>({
    avgRating: null,
    count: 0,
  });
  const [canReview, setCanReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!id || !token) return;
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) {
      setError("User not found.");
      return;
    }
    if (!res.ok) {
      setError(data?.message || "Failed to load profile.");
      return;
    }
    setUser(data.user);
    if (data.user?.reviewSummary) {
      setReviewStats(data.user.reviewSummary);
    }
  }, [id, token]);

  const loadReviews = useCallback(async () => {
    if (!id || !token) return;
    const res = await fetch(`${API_BASE_URL}/api/reviews/for/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setReviews(data.reviews || []);
      setReviewStats({
        avgRating: data.avgRating ?? null,
        count: data.count ?? 0,
      });
    }
  }, [id, token]);

  const loadEligibility = useCallback(async () => {
    if (!id || !token) {
      setCanReview(false);
      return;
    }
    // Server uses JWT — no need to decode userId on client (decode was often null on RN web).
    const res = await fetch(`${API_BASE_URL}/api/reviews/eligibility/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setCanReview(!!data.canReview);
  }, [id, token]);

  useEffect(() => {
    if (!id || !token || !isLoggedIn) {
      if (!isLoggedIn) router.replace("/login");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError("");
        await loadProfile();
        await Promise.all([loadReviews(), loadEligibility()]);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, isLoggedIn, loadProfile, loadReviews, loadEligibility]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadReviews(), loadEligibility()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.accent} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "User not found."}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.card}>
        <View style={styles.avatarSection}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(user.fullName || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.userType}>{user.userType}</Text>
        <View style={styles.divider} />
        <Text style={styles.row}>
          <Text style={styles.bold}>Location: </Text>
          {[user.city, user.stateProvince, user.country].filter(Boolean).join(", ")}
        </Text>
        {user.userType === "Handyman" && user.skills && user.skills.length > 0 ? (
          <Text style={styles.row}>
            <Text style={styles.bold}>Skills: </Text>
            {user.skills.join(", ")}
          </Text>
        ) : null}
        {user.phone ? (
          <Pressable
            onPress={() => {
              const tel = `tel:${user.phone!.replace(/\D/g, "")}`;
              Linking.openURL(tel).catch(() => {});
            }}
            style={styles.phoneRow}
          >
            <Text style={styles.row}>
              <Text style={styles.bold}>Phone: </Text>
              <Text style={styles.phoneLink}>{user.phone}</Text>
            </Text>
            <Text style={styles.phoneTapHint}>Tap to call</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <View style={styles.summaryCard}>
          {reviewStats.count > 0 && reviewStats.avgRating != null ? (
            <>
              <Text style={styles.avgNumber}>{reviewStats.avgRating}</Text>
              <StarRow value={reviewStats.avgRating} size={22} />
              <Text style={styles.reviewCount}>
                Based on {reviewStats.count} review{reviewStats.count === 1 ? "" : "s"}
              </Text>
            </>
          ) : (
            <Text style={styles.noReviewsYet}>No reviews yet.</Text>
          )}
        </View>

        {canReview ? (
          <Pressable
            style={styles.writeReviewBtn}
            onPress={() => router.push(`/write-review/${id}`)}
          >
            <Text style={styles.writeReviewBtnText}>Write a review</Text>
          </Pressable>
        ) : null}

        {reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerAvatar}>
                {r.reviewer.profileImageUrl ? (
                  <Image source={{ uri: r.reviewer.profileImageUrl }} style={styles.reviewerImg} />
                ) : (
                  <Text style={styles.reviewerInitial}>
                    {(r.reviewer.fullName || "?").charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewerName}>{r.reviewer.fullName}</Text>
                <StarRow value={r.rating} size={14} />
              </View>
            </View>
            {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
            <Text style={styles.reviewDate}>
              {new Date(r.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Back</Text>
      </Pressable>
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
    padding: 20,
    backgroundColor: AppColors.background,
  },
  card: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarSection: { marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 36, fontWeight: "700", color: "#fff" },
  name: { fontSize: 22, fontWeight: "700", color: AppColors.primaryText, marginBottom: 4 },
  userType: { fontSize: 14, color: AppColors.muted, marginBottom: 12 },
  divider: { height: 1, backgroundColor: AppColors.divider, alignSelf: "stretch", marginVertical: 12 },
  row: { fontSize: 15, color: AppColors.primaryText, marginBottom: 8 },
  bold: { fontWeight: "700" },
  phoneRow: { alignSelf: "stretch", marginBottom: 4 },
  phoneLink: { color: AppColors.accent, textDecorationLine: "underline" },
  phoneTapHint: { fontSize: 12, color: AppColors.muted, marginTop: 2 },
  text: { marginTop: 8, fontSize: 16 },
  error: { color: "red", marginBottom: 12 },
  reviewsSection: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primaryText,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: AppColors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avgNumber: { fontSize: 36, fontWeight: "700", color: AppColors.primaryText },
  reviewCount: { marginTop: 6, fontSize: 13, color: AppColors.muted },
  noReviewsYet: { fontSize: 15, color: AppColors.muted },
  starRowInline: { flexDirection: "row", marginTop: 4 },
  writeReviewBtn: {
    backgroundColor: AppColors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  writeReviewBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  reviewCard: {
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
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  reviewerImg: { width: 40, height: 40, borderRadius: 20 },
  reviewerInitial: { color: "#fff", fontWeight: "700", fontSize: 16 },
  reviewHeaderText: { flex: 1 },
  reviewerName: { fontWeight: "600", color: AppColors.primaryText, marginBottom: 2 },
  reviewComment: { fontSize: 15, color: AppColors.primaryText, lineHeight: 22 },
  reviewDate: { marginTop: 8, fontSize: 12, color: AppColors.muted },
  backBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    alignSelf: "center",
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
