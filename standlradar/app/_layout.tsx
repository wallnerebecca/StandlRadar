import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { StandlFilterProvider } from "@/contexts/StandlFilterContext";

export default function RootLayout() {
    return (
        <FavoritesProvider>
            <StandlFilterProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="standl/[id]" />
                </Stack>
            </StandlFilterProvider>
            <StatusBar style="light" />
        </FavoritesProvider>
    );
}