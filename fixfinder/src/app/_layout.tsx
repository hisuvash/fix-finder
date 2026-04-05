import { Stack, usePathname, router, type Href } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View, Image, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../shared/auth/AuthContext";
import { getAuthPayload } from "../shared/auth/jwtPayload";

const PROTECTED_ROUTES = ["/search", "/add", "/profile", "/connection-requests"];

function AppHeader() {
  const pathname = usePathname();
  const { isLoggedIn, logout, loading, token } = useAuth();
  const payload = getAuthPayload(token);
  const userType = payload?.userType;
  const isHandyman = userType === "Handyman";

  const primaryNav = !isLoggedIn
    ? []
    : isHandyman
      ? [{ label: "Requests", href: "/connection-requests" }]
      : [{ label: "Search", href: "/search" }];

  const navItems = isLoggedIn ? [...primaryNav, { label: "Profile", href: "/profile" }] : [];

  const handleNav = (href: string) => {
    if (loading) return;

    const isProtected = PROTECTED_ROUTES.includes(href);
    if (!isLoggedIn && isProtected) {
      router.push({ pathname: "/login", params: { redirect: href } });
      return;
    }

    router.push(href as Href);
  };

  return (
    <View
      style={{
        height: 60,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FAFAFA",
        shadowColor: "rgba(0, 0, 0, 0.102)",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <Pressable
        onPress={() => router.push("/")}
        style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      >
        <Image
          source={require("../../assets/images/logo.jpeg")}
          style={{ width: 152, height: 52, resizeMode: "contain" }}
        />
      </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Pressable key={item.href} onPress={() => handleNav(item.href)}>
              <Text style={{ fontWeight: active ? "700" : "500", color: "#111" }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {loading ? (
          <ActivityIndicator />
        ) : !isLoggedIn ? (
          <Pressable
            onPress={() => router.push("/login")}
            style={{
              backgroundColor: "#28a745",
              borderColor: "#28a745",
              borderWidth: 1,
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontWeight: "700", color: "#fff" }}>Login</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
          >
            <Text style={{ fontWeight: "700", color: "#111" }}>Logout</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn, loading, token } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (pathname === "/login" || pathname === "/register") return;

    const isProtected = PROTECTED_ROUTES.includes(pathname);
    if (!isLoggedIn && isProtected) {
      router.replace({ pathname: "/login", params: { redirect: pathname } });
      return;
    }

    if (!isLoggedIn || !token) return;

    const userType = getAuthPayload(token)?.userType;
    if (pathname === "/search" && userType === "Handyman") {
      router.replace("/connection-requests");
      return;
    }
    if (pathname === "/connection-requests" && userType !== "Handyman") {
      router.replace("/search");
      return;
    }
  }, [pathname, isLoggedIn, loading, token]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack
          screenOptions={{
            header: () => <AppHeader />,
          }}
        />
      </RouteGuard>
    </AuthProvider>
  );
}
