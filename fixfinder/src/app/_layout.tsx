import { Stack, usePathname, router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View, Image, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../shared/auth/AuthContext";

const PROTECTED_ROUTES = ["/search", "/add", "/profile"];

function AppHeader() {
  const pathname = usePathname();
  const { isLoggedIn, logout, loading } = useAuth();

  const navItems = [
    { label: "Search", href: "/search" }, // protected     // protected
  ];

  const handleNav = (href: string) => {
    if (loading) return;

    const isProtected = PROTECTED_ROUTES.includes(href);
    if (!isLoggedIn && isProtected) {
      router.push({ pathname: "/login", params: { redirect: href } });
      return;
    }

    router.push(href);
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
          <Pressable onPress={() => router.push("/login")}>
            <Text style={{ fontWeight: "700", color: "#111" }}>Login</Text>
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
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // ✅ never guard until boot finished
    if (loading) return;

    // ✅ never guard login/register screens
    if (pathname === "/login" || pathname === "/register") return;

    const isProtected = PROTECTED_ROUTES.includes(pathname);
    if (!isLoggedIn && isProtected) {
      router.replace({ pathname: "/login", params: { redirect: pathname } });
    }
  }, [pathname, isLoggedIn, loading]);

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