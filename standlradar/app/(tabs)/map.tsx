import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";

import { FilterChip } from "@/components/FilterChip";
import { StandlCard } from "@/components/StandlCard";
import { StandlMapMarker } from "@/components/StandlMapMarker";
import { Theme } from "@/constants/colors";
import { mockStandl } from "@/constants/mockStandl";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Standl } from "@/types/standl";
import { useStandlFilters } from "@/contexts/StandlFilterContext";
import { filterStandl } from "@/lib/filterStandl";


export default function MapScreen() {
    const {
        selectedCategory,
        setSelectedCategory,
        showOpenOnly,
        toggleOpenOnly,
    } = useStandlFilters();
    const [selectedStandl, setSelectedStandl] = useState<Standl | null>(null);

    const { favoriteStandlIds } = useFavorites();

    const filteredStandl = useMemo(() => {
        return filterStandl({
            standl: mockStandl,
            selectedCategory,
            showOpenOnly,
        });
    }, [selectedCategory, showOpenOnly]);

    return (



        <SafeAreaView style={styles.screen} edges={["top"]}>
            <View style={styles.filterContainer}>
                <Text style={styles.screenTitle}>Karte</Text>

                <View style={styles.filterBar}>
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
                        onPress={toggleOpenOnly}
                    />
                </View>
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 48.3069,
                        longitude: 14.2858,
                        latitudeDelta: 0.45,
                        longitudeDelta: 0.45,
                    }}
                >
                    {filteredStandl.map((standl) => (
                        <StandlMapMarker
                            key={standl.id}
                            standl={standl}
                            onPress={() => setSelectedStandl(standl)}
                        />
                    ))}
                </MapView>

                {filteredStandl.length === 0 ? (
                    <View style={styles.mapEmptyState}>
                        <Text style={styles.mapEmptyTitle}>Keine Standl gefunden</Text>
                        <Text style={styles.mapEmptyText}>
                            Ändere deine Filter oder deaktiviere „Jetzt geöffnet“.
                        </Text>
                    </View>
                ) : null}

                {selectedStandl ? (
                    <View style={styles.preview}>
                        <View style={styles.previewHeader}>
                            <Text style={styles.previewTitle}>Ausgewähltes Standl</Text>

                            <Pressable onPress={() => setSelectedStandl(null)}>
                                <Text style={styles.closeText}>Schließen</Text>
                            </Pressable>
                        </View>

                        <StandlCard
                            standl={selectedStandl}
                            isFavorite={favoriteStandlIds.includes(selectedStandl.id)}
                            onPress={() => {
                                router.push(`/standl/${selectedStandl.id}`);
                            }}
                        />
                    </View>
                ) : null}
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    filterContainer: {
        backgroundColor: Theme.background,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomColor: Theme.border,
        borderBottomWidth: 1,
    },
    screenTitle: {
        color: Theme.textPrimary,
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 12,
    },
    mapContainer: {
        flex: 1,
        position: "relative",

    },
    map: {
        flex: 1,
    },
    filterBar: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    preview: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 22,
        padding: 12,
    },
    previewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    previewTitle: {
        color: Theme.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    closeText: {
        color: Theme.accent,
        fontSize: 13,
        fontWeight: "700",
    },
    mapEmptyState: {
        position: "absolute",
        left: 16,
        right: 16,
        top: 16,
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
    },
    mapEmptyTitle: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 4,
    },
    mapEmptyText: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
});;;