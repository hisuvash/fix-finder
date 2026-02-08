import { Stack, usePathname, router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View, Image } from "react-native";
import { AuthProvider, useAuth } from "../shared/auth/AuthContext";


const PROTECTED_ROUTES = ["/search", "/add", "/profile"]; // routes that require login

function AppHeader() {
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Search", href: "/search" },   // protected
    { label: "Add", href: "/add" },         // protected
    { label: "Profile", href: "/profile" }, // protected
  ];

  const handleNav = (href: string) => {
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
        backgroundColor: "#2563eb", // blue
        elevation: 6,               // Android shadow
        shadowColor: "#000",        // iOS shadow
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
    >
      <Pressable
          onPress={() => router.push("/")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Image
            source={require("../../assets/images/logo.jpeg")}
            style={{
              width: 152,
              height: 52,
              resizeMode: "contain",
            }}
          />
          <Text
            style={{
              fontWeight: "700",
              color: "white",
              fontSize: 18,
            }}
          >
            
          </Text>
        </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Pressable key={item.href} onPress={() => handleNav(item.href)}>
              <Text style={{
                 fontWeight: active ? "700" : "500",
                  color: "white",              // ✅ ADD THIS
                }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}

    {!isLoggedIn ? (
      <Pressable onPress={() => router.push("/login")}>
        <Text style={{ fontWeight: "700", color: "white" }}>Login</Text>
      </Pressable>
    ) : (
      <Pressable onPress={logout}>
        <Text style={{ fontWeight: "700", color: "white" }}>Logout</Text>
      </Pressable>
    )}
      </View>
    </View>
  );
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const isProtected = PROTECTED_ROUTES.includes(pathname);
    if (!isLoggedIn && isProtected) {
      router.replace({ pathname: "/login", params: { redirect: pathname } });
    }
  }, [pathname, isLoggedIn]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack
          screenOptions={{
            header: () => <AppHeader />, // ✅ common header on all pages
          }}
        />
      </RouteGuard>
    </AuthProvider>
  );
}