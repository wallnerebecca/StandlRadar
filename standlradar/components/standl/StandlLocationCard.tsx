import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { InfoRow } from "@/components/standl/InfoRow";
import { Theme } from "@/constants/colors";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { calculateDistanceKm } from "@/lib/calculateDistance";
import { formatFullAddress } from "@/lib/formatStandlAddress";
import { formatDistance } from "@/lib/formatDistance";
import { openNavigation } from "@/lib/openNavigation";
import type { StandlLocation } from "@/types/standlLocation";

type StandlLocationCardProps = {
    location: StandlLocation;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
};

export function StandlLocationCard({
    location,
    index,
    isExpanded,
    onToggle
}: StandlLocationCardProps) {
    const { userLocation } = useUserLocation();

    const addressValue = formatFullAddress(location);

    const distanceKm = userLocation
        ? calculateDistanceKm(userLocation, {
            latitude: location.latitude,
            longitude: location.longitude,
        })
        : undefined;

    return (
        <View style={styles.card}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                    isExpanded
                        ? "Standortdetails schließen"
                        : "Standortdetails öffnen"
                }
                onPress={onToggle}
                style={({ pressed }) => [
                    styles.header,
                    pressed && styles.headerPressed,
                ]}
            >
                <View style={styles.headerText}>

                    <Text style={styles.title}>
                        {location.locationName || `Standort ${index + 1}`}
                    </Text>

                    <Text style={styles.city}>
                        {location.city || "Ort nicht angegeben"}
                    </Text>
                </View>

                <Ionicons
                    name={
                        isExpanded
                            ? "chevron-up-outline"
                            : "chevron-down-outline"
                    }
                    size={20}
                    color={Theme.textSecondary}
                />
            </Pressable>
            {isExpanded ? (
                <View style={styles.details}>
                    <InfoRow
                        icon="location-outline"
                        label="Adresse"
                        value={addressValue || "Keine Adresse verfügbar"}
                    />

                    {distanceKm !== undefined ? (
                        <InfoRow
                            icon="navigate-outline"
                            label="Route in Google Maps öffnen"
                            value={`${formatDistance(distanceKm)} entfernt`}
                            onPress={() =>
                                openNavigation({
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                })
                            }
                        />
                    ) : null}
                </View>

            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        overflow: "hidden",
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 17,
        fontWeight: "800",
    },
    header: {
        minHeight: 64,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    headerPressed: {
        opacity: 0.8,
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 17,
        fontWeight: "800",
    },
    city: {
        color: Theme.textSecondary,
        fontSize: 13,
        marginTop: 3,
    },
    details: {
        borderTopColor: Theme.border,
        borderTopWidth: 1,
        padding: 12,
        gap: 10,
    },
});;;;;