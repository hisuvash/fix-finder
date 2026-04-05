import React, { useMemo } from "react";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../shared/auth/AuthContext";
import { getAuthPayload } from "../shared/auth/jwtPayload";
import { AppColors } from "../shared/theme/colors";
import { HANDYMAN_SKILL_OPTIONS } from "../shared/constants/handymanSkills";

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryBtn}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryBtn}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureBody}>{body}</Text>
    </View>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <View style={styles.stepNumCircle}>
      <Text style={styles.stepNumText}>{n}</Text>
    </View>
  );
}

export default function Home() {
  const { isLoggedIn, token, loading } = useAuth();
  const payload = getAuthPayload(token);
  const isHandyman = payload?.userType === "Handyman";

  const topSkills = useMemo(() => HANDYMAN_SKILL_OPTIONS.slice(0, 10), []);

  const primaryCta = !isLoggedIn
    ? { label: "Create an account", action: () => router.push("/register") }
    : isHandyman
      ? { label: "View requests", action: () => router.push("/connection-requests") }
      : { label: "Find a handyman", action: () => router.push("/search") };

  const secondaryCta = !isLoggedIn
    ? { label: "Log in", action: () => router.push("/login") }
    : { label: "Go to profile", action: () => router.push("/profile") };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* HERO */}
      <View style={styles.hero}>
        <Image
          source={require("../../assets/images/logo.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.heroTitle}>FixFinder</Text>
        <Text style={styles.heroSubtitle}>
          Find trusted local help for repairs, installs, and upgrades — fast.
        </Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Skill-based search</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Connection requests</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified reviews</Text>
          </View>
        </View>

        {loading ? (
          <Text style={styles.mutedSmall}>Loading your session…</Text>
        ) : null}
      </View>

      {/* VALUE PROPS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why FixFinder?</Text>
        <Text style={styles.sectionSubtitle}>
          A simple, transparent way to match clients with the right local handyman — and build trust through real reviews.
        </Text>

        <View style={styles.featureGrid}>
          <FeatureCard
            title="Search by skill + location"
            body="Filter handymen by city/state/country and an approved list of skills — no guesswork."
          />
          <FeatureCard
            title="Connect with confidence"
            body="Send a request first. Phone numbers are only revealed once a connection is accepted."
          />
          <FeatureCard
            title="Real reviews"
            body="Only users who have actually connected can review — keeping feedback relevant and trustworthy."
          />
        </View>
      </View>

      {/* HOW IT WORKS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.steps}>
          <View style={styles.step}>
            <StepNumber n={1} />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Search</Text>
              <Text style={styles.stepBody}>Choose a skill and location to find the best match.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <StepNumber n={2} />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Request</Text>
              <Text style={styles.stepBody}>Send a connection request to start the conversation.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <StepNumber n={3} />
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Review</Text>
              <Text style={styles.stepBody}>After connecting, leave a review to help the community.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* SKILLS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular skills</Text>
        <Text style={styles.sectionSubtitle}>Examples of what you can search for.</Text>
        <View style={styles.chipsRow}>
          {topSkills.map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={styles.inlineCtaRow}>
          <Text style={styles.inlineCtaText}>
            Want to see results right away?
          </Text>
          <Pressable
            onPress={() => router.push("/search")}
            style={styles.inlineLink}
            accessibilityRole="button"
          >
            <Text style={styles.inlineLinkText}>Open Search</Text>
          </Pressable>
        </View>
      </View>

      {/* FINAL CTA */}
      <View style={[styles.section, styles.finalCta]}>
        <Text style={styles.finalTitle}>Ready to get started?</Text>
        <Text style={styles.finalBody}>
          {isHandyman
            ? "Accept requests, connect with clients, and build your reputation with reviews."
            : "Find the right handyman, connect, and hire with confidence."}
        </Text>
        <View style={styles.heroCtas}>
          <PrimaryButton label={primaryCta.label} onPress={primaryCta.action} />
          <SecondaryButton label={secondaryCta.label} onPress={secondaryCta.action} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: AppColors.background },
  content: { padding: 20, paddingBottom: 44 },

  hero: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  logo: { width: 180, height: 64, alignSelf: "center", marginBottom: 10 },
  heroTitle: { fontSize: 34, fontWeight: "800", color: AppColors.primaryText, textAlign: "center" },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: AppColors.muted,
    textAlign: "center",
  },
  heroCtas: { marginTop: 18, gap: 12 },
  primaryBtn: {
    backgroundColor: AppColors.accent,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: AppColors.primaryText,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryBtnText: { color: AppColors.primaryText, fontWeight: "700", fontSize: 16 },

  heroMetaRow: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  badge: { backgroundColor: "rgba(80, 99, 249, 0.12)", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  badgeText: { color: AppColors.primaryText, fontWeight: "700", fontSize: 12 },
  mutedSmall: { marginTop: 10, textAlign: "center", color: AppColors.muted, fontSize: 12 },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: AppColors.primaryText, marginBottom: 6 },
  sectionSubtitle: { color: AppColors.muted, lineHeight: 20 },

  featureGrid: { marginTop: 12, gap: 12 },
  featureCard: {
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  featureTitle: { fontSize: 15, fontWeight: "800", color: AppColors.primaryText, marginBottom: 6 },
  featureBody: { color: AppColors.muted, lineHeight: 20 },

  steps: { marginTop: 12, gap: 12 },
  step: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: AppColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  stepNumCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: AppColors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: { color: "#fff", fontWeight: "900", fontSize: 16, lineHeight: 18 },
  stepText: { flex: 1 },
  stepTitle: { fontWeight: "800", color: AppColors.primaryText, marginBottom: 4, fontSize: 15 },
  stepBody: { color: AppColors.muted, lineHeight: 20 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  chip: { backgroundColor: "rgba(17, 24, 39, 0.06)", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  chipText: { color: AppColors.primaryText, fontWeight: "700", fontSize: 12 },

  inlineCtaRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  inlineCtaText: { color: AppColors.muted },
  inlineLink: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: "rgba(80, 99, 249, 0.12)" },
  inlineLinkText: { color: AppColors.accent, fontWeight: "800" },

  finalCta: {
    backgroundColor: AppColors.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  finalTitle: { fontSize: 18, fontWeight: "900", color: AppColors.primaryText, textAlign: "center" },
  finalBody: { marginTop: 8, color: AppColors.muted, textAlign: "center", lineHeight: 20 },
});