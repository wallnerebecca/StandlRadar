import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { StandlFilterProvider } from "@/contexts/StandlFilterContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <FavoritesProvider>
                <StandlFilterProvider>

                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="standl/[id]" />
                        <Stack.Screen name="standl/new" />
                        <Stack.Screen name="auth/login" />
                        <Stack.Screen name="auth/register" />
                        <Stack.Screen name="owner/index" />
                    </Stack>

                </StandlFilterProvider>
                <StatusBar style="light" />
            </FavoritesProvider>
        </AuthProvider >
    );
}