import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { StandlLocationCard } from "@/components/standl/StandlLocationCard";
import { Theme } from "@/constants/colors";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { calculateDistanceKm } from "@/lib/calculateDistance";
import type { StandlLocation } from "@/types/standlLocation";

type StandlLocationsSectionProps = {
    locations: StandlLocation[];
    canEdit: boolean;
    standlId: string;
};

export function StandlLocationsSection({
    locations,
    canEdit,
    standlId
}: StandlLocationsSectionProps) {
    const { userLocation } = useUserLocation();

    const initialLocationId = useMemo(() => {
        if (locations.length === 0) {
            return null;
        }

        if (!userLocation) {
            return locations[0].id;
        }

        const nearestLocation = locations.reduce(
            (nearest, current) => {
                const nearestDistance = calculateDistanceKm(
                    userLocation,
                    nearest
                );

                const currentDistance = calculateDistanceKm(
                    userLocation,
                    current
                );

                return currentDistance < nearestDistance
                    ? current
                    : nearest;
            }
        );

        return nearestLocation.id;
    }, [locations, userLocation]);

    const [expandedLocationId, setExpandedLocationId] =
        useState<string | null>(initialLocationId);

    useEffect(() => {
        setExpandedLocationId(initialLocationId);
    }, [initialLocationId]);

    if (locations.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Standorte</Text>

                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        Für dieses Standl sind noch keine Standorte eingetragen.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                Standorte ({locations.length})
            </Text>

            <View style={styles.locationList}>
                {locations.map((location, index) => (
                    <StandlLocationCard
                        key={location.id}
                        location={location}
                        index={index}
                        isExpanded={
                            expandedLocationId === location.id
                        }
                        onToggle={() =>
                            setExpandedLocationId((currentId) =>
                                currentId === location.id
                                    ? null
                                    : location.id
                            )
                        }
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 18,
        marginBottom: 22,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 12,
    },
    locationList: {
        gap: 10,
    },
    emptyCard: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
    },
    emptyText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
});