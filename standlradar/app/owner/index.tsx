import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/userProfile";
import type { UserProfile } from "@/types/user";
import { Standl } from "@/types/standl";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getOwnerStandlFromFirestore } from "@/lib/standlService";
import { StandlCard } from "@/components/StandlCard";

export default function OwnerScreen() {
    const { user, isLoading } = useAuth();
    const { favoriteStandlIds } = useFavorites();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const [ownerStandl, setOwnerStandl] = useState<Standl[]>([]);
    const [isOwnerStandlLoading, setIsOwnerStandlLoading] = useState(false);

    useEffect(() => {
        async function loadUserProfile() {
            if (!user) {
                setUserProfile(null);
                setIsProfileLoading(false);
                return;
            }

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

    useEffect(() => {
        async function loadOwnerStandl() {
            if (!user || userProfile?.role !== "owner") {
                setOwnerStandl([]);
                return;
            }

            setIsOwnerStandlLoading(true);

            try {
                const standl = await getOwnerStandlFromFirestore(user.uid);
                setOwnerStandl(standl);
            } catch (error) {
                console.warn("Owner-Standl konnten nicht geladen werden:", error);
                setOwnerStandl([]);
            } finally {
                setIsOwnerStandlLoading(false);
            }
        }

        loadOwnerStandl();
    }, [user, userProfile]);


    if (isLoading || isProfileLoading) {
        return (
            <View style={styles.centeredScreen}>
                <Text style={styles.loadingText}>Besitzerbereich wird geladen...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centeredScreen}>
                <Text style={styles.title}>Login erforderlich</Text>
                <Text style={styles.text}>
                    Melde dich an, um den Besitzerbereich zu verwenden.
                </Text>

                <PrimaryButton
                    label="Einloggen"
                    onPress={() => router.push("/auth/login")}
                />

                <SecondaryButton label="Zurück" onPress={() => router.back()} />
            </View>
        );
    }

    if (userProfile?.role !== "owner") {
        return (
            <View style={styles.centeredScreen}>
                <Text style={styles.title}>Kein Besitzerkonto</Text>
                <Text style={styles.text}>
                    Dieser Bereich ist für Standl-Besitzer*innen vorgesehen.
                </Text>

                <SecondaryButton label="Zurück" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <AppHeader
                title="Meine Standl"
                subtitle="Verwalte deine Standl, Standzeiten und Informationen."
            />

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Deine Standl</Text>
                {isOwnerStandlLoading ? (
                    <Text style={styles.cardText}>Standl werden geladen...</Text>
                ) : ownerStandl.length > 0 ? (
                    <View style={styles.standlList}>
                        {ownerStandl.map((standl) => (
                            <StandlCard
                                key={standl.id}
                                standl={standl}
                                isFavorite={favoriteStandlIds.includes(standl.id)}
                                onPress={() => {
                                    router.push(`/standl/${standl.id}`);
                                }}
                            />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.cardText}>
                        Du hast noch keine Standl erstellt oder übernommen.
                    </Text>
                )}

                <PrimaryButton
                    label="Standl hinzufügen"
                    onPress={() => {
                        router.push({
                            pathname: "/standl/new",
                            params: { mode: "owner" },
                        });
                    }}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Geplante Funktionen</Text>
                <Text style={styles.cardText}>
                    Öffnungszeiten, Preise, Heute-geschlossen-Status, Bilder und
                    Standortdaten werden später hier bearbeitet.
                </Text>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    content: {
        padding: 24,
        paddingTop: 64,
        gap: 16,
    },
    centeredScreen: {
        flex: 1,
        backgroundColor: Theme.background,
        padding: 24,
        justifyContent: "center",
        gap: 14,
    },
    loadingText: {
        color: Theme.textSecondary,
        fontSize: 16,
        textAlign: "center",
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 26,
        fontWeight: "800",
    },
    text: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
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
    standlList: {
        gap: 12,
    },
});