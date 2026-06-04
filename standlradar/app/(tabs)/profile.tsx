import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { Theme } from "@/constants/colors";
import { firebaseApp } from "@/lib/firebase";

import { getUserProfile } from "@/lib/userProfile";
import type { UserProfile } from "@/types/user";

import { useAuth } from "@/contexts/AuthContext";


export default function ProfileScreen() {

    const { user, isLoading, logout } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    useEffect(() => {
        async function loadUserProfile() {
            if (!user) {
                setUserProfile(null);
                return;
            }

            setIsProfileLoading(true);

            try {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
            } catch (error) {
                console.warn("Userprofil konnte nicht geladen werden:", error);
                setUserProfile(null);
            } finally {
                setIsProfileLoading(false);
            }
        }

        loadUserProfile();
    }, [user]);


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
                    <Text style={styles.cardTitle}>
                        {isProfileLoading
                            ? "Profil wird geladen..."
                            : userProfile?.username ?? "Eingeloggt"}
                    </Text>

                    <Text style={styles.cardText}>{user.email}</Text>

                    <Text style={styles.cardText}>
                        Rolle: {userProfile?.role === "owner" ? "Standl-Besitzer*in" : "Nutzer*in"}
                    </Text>

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