import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { Theme } from "@/constants/colors";
import { firebaseApp } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {

    const { user, isLoading, logout } = useAuth();

    return (
        <View style={styles.container}>
            <AppHeader
                title="Profil"
                subtitle="Willkommen beim StandlRadar!"
            />

            {isLoading ? (
                <Text style={styles.hint}>Loginstatus wird geladen...</Text>
            ) : user ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Eingeloggt</Text>
                    <Text style={styles.cardText}>{user.email}</Text>

                    <PrimaryButton label="Ausloggen" onPress={logout} />
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nicht eingeloggt</Text>
                    <Text style={styles.cardText}>
                        Mit Login kannst du später Favoriten dauerhaft speichern und Standl liken.
                    </Text>

                    <PrimaryButton
                        label="Einloggen"
                        onPress={() => router.push("/auth/login")}
                    />

                    <SecondaryButton
                        label="Registrieren"
                        onPress={() => router.push("/auth/register")}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
        padding: 24,
        paddingTop: 64,
    },
    hint: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 18,
    },
    card: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        gap: 12,
    },
    cardTitle: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "800",
    },
    cardText: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
});