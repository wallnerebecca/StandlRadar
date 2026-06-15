import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { StandlFilterProvider } from "@/contexts/StandlFilterContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserLocationProvider } from "@/contexts/UserLocationContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <UserLocationProvider>
                <FavoritesProvider>
                    <StandlFilterProvider>
                        <Stack screenOptions={{ headerShown: false }} />
                    </StandlFilterProvider>
                    <StatusBar style="light" />
                </FavoritesProvider>
            </UserLocationProvider>
        </AuthProvider >
    );
}