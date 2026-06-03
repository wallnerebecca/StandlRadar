import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export default function RootLayout() {
    return (
        <FavoritesProvider>
            <StatusBar style="light" />

            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="standl/[id]" />
            </Stack>

        </FavoritesProvider>
    );
}