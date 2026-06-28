import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { SearchBar } from "@/components/search/SearchBar";
import { StandlCard } from "@/components/standl/StandlCard";


import { Theme } from "@/constants/colors";

import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";

import { getOwnerStandlFromFirestore } from "@/lib/standlService";
import { routes } from "@/lib/routes";

import type { Standl } from "@/types/standl";
import { ScreenContainer } from "@/components/layout/ScreenContainer";

export default function OwnerScreen() {
    const {
        user,
        userProfile,
        isLoading,
        isProfileLoading,
    } = useAuth();
    const { favoriteStandlIds } = useFavorites();

    const [ownerStandl, setOwnerStandl] = useState<Standl[]>([]);
    const [isOwnerStandlLoading, setIsOwnerStandlLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOwnerStandl = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-AT");

        if (!normalizedQuery) {
            return ownerStandl;
        }

        return ownerStandl.filter((standl) =>
            standl.name
                .toLocaleLowerCase("de-AT")
                .includes(normalizedQuery)
        );
    }, [ownerStandl, searchQuery]);

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
    }, [user, userProfile?.role]);


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
                    onPress={() => router.push(routes.login)}
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

    const addStandlButton = (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Standl hinzufügen"
            onPress={() => router.push(routes.newOwnerStandl)}
            style={({ pressed }) => [
                styles.floatingAddButton,
                pressed && styles.pressed,
            ]}
        >
            <Ionicons
                name="add"
                size={30}
                color={Theme.textPrimary}
            />
        </Pressable>
    );

    return (
        <ScreenContainer
            contentStyle={styles.content}
            floatingContent={addStandlButton}
        >
            <AppHeader
                title="Meine Standl"
                subtitle="Verwalte Standorte und Zeiten deiner Standl."
            />

            <SecondaryButton
                label="Zum Radar"
                onPress={() => router.replace(routes.radar)}
            />

            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Meine Standl durchsuchen"
            />

            <>
                {isOwnerStandlLoading ? (
                    <Text style={styles.listMessage}>Standl werden geladen...</Text>
                ) : filteredOwnerStandl.length > 0 ? (
                    <View style={styles.standlList}>
                        {filteredOwnerStandl.map((standl) => (
                            <StandlCard
                                key={standl.id}
                                standl={standl}
                                isFavorite={favoriteStandlIds.includes(standl.id)}
                                showOfficialBadge={false}
                                onPress={() => {
                                    router.push(routes.standlDetail(standl.id));
                                }}
                            />
                        ))}
                    </View>
                ) : (
                    <Text style={styles.listMessage}>
                        {ownerStandl.length === 0
                            ? "Du hast noch keine Standl erstellt oder übernommen."
                            : `Kein Standl für „${searchQuery.trim()}“ gefunden.`}
                    </Text>
                )}
            </>




        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
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
    listMessage: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    standlList: {
        gap: 12,
    },
    floatingAddButton: {
        position: "absolute",
        right: 24,
        bottom: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: Theme.secondary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    pressed: {
        opacity: 0.8,
    },
});
