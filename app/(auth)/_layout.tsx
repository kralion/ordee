import { useAuth } from "@/context";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator } from "react-native-paper";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  //TODO: This is what we see when there is a loading state in the render
  if (loading) {
    return <ActivityIndicator />;
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
