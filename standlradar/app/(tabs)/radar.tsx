import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { FilterChip } from "@/components/FilterChip";
import { RadarStartCTA } from "@/components/RadarStartCTA";
import { SearchBar } from "@/components/SearchBar";
import { SearchFavoriteToggle } from "@/components/SearchFavoriteToggle";
import { StandlCard } from "@/components/StandlCard";
import { Theme } from "@/constants/colors";
import { mockStandl } from "@/constants/mockStandl";
import { useFavorites } from "@/contexts/FavoritesContext";

import type { StandlCategory } from "@/types/standl";


type CategoryFilter = "all" | StandlCategory;
type ToggleValue = "search" | "favorites";

export default function RadarScreen() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<CategoryFilter>("all");
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [activeView, setActiveView] = useState<ToggleValue>("search");
    const userRole: "user" | "owner" = "owner";

    const { favoriteStandlIds } = useFavorites();

    const filteredStandl = useMemo(() => {
        let result = mockStandl;

        if (activeView === "favorites") {
            result = result.filter((standl) => favoriteStandlIds.includes(standl.id));
        }

        if (selectedCategory !== "all") {
            result = result.filter((standl) => standl.category === selectedCategory);
        }

        if (showOpenOnly) {
            result = result.filter((standl) =>
                ["open", "likelyOpen"].includes(standl.openingStatus.type)
            );
        }

        const normalizedQuery = searchQuery.trim().toLowerCase();

        if (normalizedQuery.length > 0) {
            result = result.filter((standl) => {
                return (
                    standl.name.toLowerCase().includes(normalizedQuery) ||
                    standl.city.toLowerCase().includes(normalizedQuery) ||
                    standl.locationName.toLowerCase().includes(normalizedQuery) ||
                    standl.postalCode.includes(normalizedQuery)
                );
            });
        }

        return result;
    }, [activeView, favoriteStandlIds, searchQuery, selectedCategory, showOpenOnly]);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <AppHeader
                title="StandlRadar"
                subtitle="Servus, wonach suchst du?"
            />

            <View style={styles.ctaList}>

                {userRole === "owner" ? (
                    <RadarStartCTA
                        title="Zu meinen Standl"
                        description="Verwalte Zeiten, Preise und Infos zu deinen Standl."
                        icon="storefront-outline"
                        onPress={() => {
                            //router.push("/owner");
                            console.log("Zu meinen Standl");
                        }}
                    />
                ) : null}

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

            <View style={styles.chipRow}>
                <FilterChip
                    label="Alle"
                    selected={selectedCategory === "all"}
                    onPress={() => setSelectedCategory("all")}
                />

                <FilterChip
                    label="Hendl"
                    selected={selectedCategory === "hendl"}
                    onPress={() => setSelectedCategory("hendl")}
                />

                <FilterChip
                    label="Steckerlfisch"
                    selected={selectedCategory === "steckerlfisch"}
                    onPress={() => setSelectedCategory("steckerlfisch")}
                />

                <FilterChip
                    label="Jetzt geöffnet"
                    selected={showOpenOnly}
                    onPress={() => setShowOpenOnly((current) => !current)}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {activeView === "favorites" ? "Deine Favoriten" : "Standl in deiner Nähe"}
                </Text>

                <Text style={styles.resultCount}>
                    {filteredStandl.length} gefunden
                </Text>
            </View>

            {filteredStandl.length > 0 ? (
                <View style={styles.cardList}>
                    {filteredStandl.map((standl) => (
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
                            ? "Noch keine Favoriten gefunden"
                            : "Keine Standl gefunden"}
                    </Text>

                    <Text style={styles.emptyText}>
                        {activeView === "favorites"
                            ? "Speichere Standl als Favorit, damit du sie hier schnell wiederfindest."
                            : "Versuch eine andere Suche oder ändere deine Filter."}
                    </Text>
                </View>
            )}
        </ScrollView>
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
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 28,
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
});