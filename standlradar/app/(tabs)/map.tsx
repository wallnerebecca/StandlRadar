import { router } from "expo-router";
import { useEffect, useRef, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { type Region } from "react-native-maps";

import { FilterChip } from "@/components/buttons/FilterChip";
import { StandlCard } from "@/components/standl/StandlCard";
import { StandlMapMarker } from "@/components/standl/StandlMapMarker";
import { StandlFilterChips } from "@/components/filters/StandlFilterContainer";


import { Theme } from "@/constants/colors";
import { useStandl } from "@/hooks/useStandl";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useStandlFilters } from "@/contexts/StandlFilterContext";
import { useUserLocation } from "@/contexts/UserLocationContext";

import { filterStandl } from "@/lib/filterStandl";


const AUSTRIA_REGION: Region = {
    latitude: 47.5162,
    longitude: 14.5501,
    latitudeDelta: 5.2,
    longitudeDelta: 5.2,
};

export default function MapScreen() {
    const {
        selectedCategory,
        setSelectedCategory,
        showOpenOnly,
        toggleOpenOnly,
    } = useStandlFilters();
    const [selectedStandlId, setSelectedStandlId] = useState<string | null>(null);

    const { favoriteStandlIds } = useFavorites();
    const { standl } = useStandl();


    const filteredStandl = useMemo(() => {
        return filterStandl({
            standl,
            selectedCategory,
            showOpenOnly,
        });
    }, [selectedCategory, showOpenOnly, standl]);



    const mapRef = useRef<MapView | null>(null);

    const {
        userLocation,
        isLoadingLocation,
    } = useUserLocation();

    const selectedStandl = useMemo(() => {
        if (!selectedStandlId) {
            return null;
        }

        return filteredStandl.find((item) => item.id === selectedStandlId) ?? null;
    }, [selectedStandlId, filteredStandl]);


    useEffect(() => {
        if (isLoadingLocation || !userLocation) {
            return;
        }

        mapRef.current?.animateToRegion(
            {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            },
            700
        );
    }, [isLoadingLocation, userLocation]);


    return (
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <View style={styles.filterContainer}>
                <Text style={styles.screenTitle}>Karte</Text>

                <StandlFilterChips
                    selectedCategory={selectedCategory}
                    onChangeCategory={setSelectedCategory}
                    showOpenOnly={showOpenOnly}
                    onToggleOpenOnly={toggleOpenOnly}
                />
            </View>
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={AUSTRIA_REGION}
                    showsUserLocation={Boolean(userLocation)}
                    showsMyLocationButton={Boolean(userLocation)}
                    toolbarEnabled={false}
                >
                    {filteredStandl.map((standl) => (
                        <StandlMapMarker
                            key={standl.id}
                            standl={standl}
                            onPress={() => setSelectedStandlId(standl.id)}
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

                            <Pressable onPress={() => setSelectedStandlId(null)}>
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
});