import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/AppHeader";
import { FilterChip } from "@/components/buttons/FilterChip";
import { RadarStartCTA } from "@/components/buttons/RadarStartCTA";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFavoriteToggle } from "@/components/search/SearchFavoriteToggle";
import { StandlCard } from "@/components/standl/StandlCard";
import { StandlFilterChips } from "@/components/filters/StandlFilterContainer";

import { Theme } from "@/constants/colors";

import { useFavorites } from "@/contexts/FavoritesContext";
import { useStandlFilters } from "@/contexts/StandlFilterContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLocation } from "@/contexts/UserLocationContext";

import { filterStandl } from "@/lib/filterStandl";
import { calculateDistanceKm } from "@/lib/calculateDistance";
import { getUserProfile } from "@/lib/userProfileService";

import { useStandl } from "@/hooks/useStandl";

import type { UserProfile } from "@/types/user";



type ToggleValue = "search" | "favorites";

export default function RadarScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const {
        standl,
        isLoading: isStandlLoading,
        errorMessage: standlErrorMessage,
    } = useStandl();
    const {
        selectedCategory,
        setSelectedCategory,
        showOpenOnly,
        toggleOpenOnly,
    } = useStandlFilters();
    const [activeView, setActiveView] = useState<ToggleValue>("search");

    const { user } = useAuth();
    const { userLocation } = useUserLocation();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        async function loadUserProfile() {
            if (!user) {
                setUserProfile(null);
                return;
            }

            try {
                const profile = await getUserProfile(user.uid);
                setUserProfile(profile);
            } catch (error) {
                console.warn("Userprofil konnte nicht geladen werden:", error);
                setUserProfile(null);
            }
        }

        loadUserProfile();
    }, [user]);

    const { favoriteStandlIds } = useFavorites();

    const filteredStandl = useMemo(() => {
        return filterStandl({
            standl,
            searchQuery,
            selectedCategory,
            showOpenOnly,
            favoriteStandlIds,
            showFavoritesOnly: activeView === "favorites",
        });
    }, [activeView, favoriteStandlIds, searchQuery, selectedCategory, showOpenOnly, standl, userLocation]);

    const sortedStandl = useMemo(() => {
        if (!userLocation) {
            return filteredStandl;
        }

        return [...filteredStandl].sort((firstStandl, secondStandl) => {
            const firstDistance = calculateDistanceKm(userLocation, {
                latitude: firstStandl.latitude,
                longitude: firstStandl.longitude,
            });

            const secondDistance = calculateDistanceKm(userLocation, {
                latitude: secondStandl.latitude,
                longitude: secondStandl.longitude,
            });

            return firstDistance - secondDistance;
        });

    }, [filteredStandl, userLocation]);

    return (
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                <AppHeader
                    title="StandlRadar"
                    subtitle="Servus, wos derfs heut sei?"
                />

                <View style={styles.ctaList}>

                    {userProfile?.role === "owner" ? (
                        <RadarStartCTA
                            title="Zu meinen Standl"
                            description="Verwalte Zeiten, Preise und Infos zu deinen Standl."
                            icon="storefront-outline"
                            onPress={() => {
                                router.push("/owner");
                            }}
                        />
                    ) : null}

                    <RadarStartCTA
                        title="Standl vorschlagen"
                        description="Füge ein Hendl- oder Steckerlfisch-Standl zur Karte hinzu."
                        icon="add-circle-outline"
                        onPress={() => {
                            router.push({
                                pathname: "/standl/new",
                                params: { mode: "community" },
                            });
                        }}
                    />

                    <RadarStartCTA
                        title="Standl in der Nähe finden"
                        description="Zeig dir Hendl und Steckerlfisch rund um dich."
                        icon="navigate-outline"
                        variant="primary"
                        onPress={() => {
                            router.push("/(tabs)/map");
                        }}
                    />


                </View>

                <View style={styles.searchArea}>
                    <SearchFavoriteToggle value={activeView} onChange={setActiveView} />

                    <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                </View>

                <Text style={styles.sectionTitle}>Schnell filtern</Text>

                <StandlFilterChips
                    selectedCategory={selectedCategory}
                    onChangeCategory={setSelectedCategory}
                    showOpenOnly={showOpenOnly}
                    onToggleOpenOnly={toggleOpenOnly}
                />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {activeView === "favorites" ? "Deine Favoriten" : "Standl in deiner Nähe"}
                    </Text>

                    <Text style={styles.resultCount}>
                        {sortedStandl.length} gefunden
                    </Text>
                </View>

                {isStandlLoading ? (
                    <Text style={styles.infoText}>Standl werden geladen...</Text>
                ) : null}

                {standlErrorMessage ? (
                    <Text style={styles.errorText}>{standlErrorMessage}</Text>
                ) : null}

                {sortedStandl.length > 0 ? (
                    <View style={styles.cardList}>
                        {sortedStandl.map((standl) => (
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
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>
                            {activeView === "favorites"
                                ? "Keine Favoriten gefunden"
                                : "Keine Standl gefunden"}
                        </Text>

                        <Text style={styles.emptyText}>
                            {activeView === "favorites"
                                ? "Speichere Standl als Favorit, damit du sie hier schnell wiederfindest."
                                : "Versuche eine andere Suche oder ändere deine Filter."}
                        </Text>
                    </View>
                )}
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
    ctaList: {
        gap: 12,
        marginBottom: 24,
    },
    searchArea: {
        gap: 12,
        marginBottom: 28,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    resultCount: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginTop: -6,
    },
    cardList: {
        gap: 12,
        paddingBottom: 32,
    },
    emptyState: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 20,
        marginBottom: 32,
    },
    emptyTitle: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyText: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    infoText: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginBottom: 12,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        marginBottom: 12,
    },
});