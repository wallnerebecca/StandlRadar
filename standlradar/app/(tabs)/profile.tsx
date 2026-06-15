import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { OwnerStandlCTA } from "@/components/standl/OwnerStandlCTA";

import { Theme } from "@/constants/colors";
import { useUserLocation } from "@/contexts/UserLocationContext";

import { routes } from "@/lib/routes";
import { getUserProfile } from "@/lib/userProfileService";
import type { UserProfile } from "@/types/user";

import { useAuth } from "@/contexts/AuthContext";


export default function ProfileScreen() {

    const { user, isLoading, logout } = useAuth();
    const {
        permissionStatus,
        userLocation,
        isLoadingLocation,
    } = useUserLocation();
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
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                <AppHeader
                    title="Profil"
                    subtitle={`Servus ${userProfile?.username ?? 'unbekannt'}!`}
                />
                <View style={styles.container}>


                    {isLoading ? (
                        <Text style={styles.hint}>Loginstatus wird geladen...</Text>
                    ) : user ? (
                        <View style={styles.profile}>
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


                                <Text style={styles.cardText}>
                                    Standortstatus: {permissionStatus}
                                </Text>

                                <Text style={styles.cardText}>
                                    {isLoadingLocation
                                        ? "Standort wird geladen..."
                                        : userLocation
                                            ? `Position verfügbar: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                                            : "Keine Position verfügbar"}
                                </Text>



                                <PrimaryButton label="Ausloggen" onPress={logout} />
                            </View>
                            <View>
                                <OwnerStandlCTA role={userProfile?.role} />
                            </View>

                        </View>

                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Nicht eingeloggt</Text>
                            <Text style={styles.cardText}>
                                Mit Login kannst du später Favoriten dauerhaft speichern und Standl liken.
                            </Text>

                            <PrimaryButton
                                label="Einloggen"
                                onPress={() => router.push(routes.login)}
                            />

                            <SecondaryButton
                                label="Registrieren"
                                onPress={() => router.push("/auth/register")}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        padding: 12,
        paddingTop: 24,
    },
    container: {
        flex: 1,
        backgroundColor: Theme.background,

    },
    profile: {
        gap: 12,
        marginBottom: 24,
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
});;