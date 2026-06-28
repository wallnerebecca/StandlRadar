import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { StandlLocationCard } from "@/components/standl/StandlLocationCard";
import { Theme } from "@/constants/colors";
import { useUserLocation } from "@/contexts/UserLocationContext";

import { getLocationOpeningStatus } from "@/lib/getLocationOpeningStatus";
import { calculateDistanceKm } from "@/lib/calculateDistance";

import { useCurrentTime } from "@/hooks/useCurrentTime";

import type { StandlLocation } from "@/types/standlLocation";

type StandlLocationsSectionProps = {
    locations: StandlLocation[];
    canEdit: boolean;
    standlId: string;
};

function getNearestLocation(
    locations: StandlLocation[],
    userLocation?: {
        latitude: number;
        longitude: number;
    } | null
) {
    if (!userLocation) {
        return locations[0];
    }

    return locations.reduce((nearestLocation, currentLocation) => {
        const nearestDistance = calculateDistanceKm(
            userLocation,
            nearestLocation
        );

        const currentDistance = calculateDistanceKm(
            userLocation,
            currentLocation
        );

        return currentDistance < nearestDistance
            ? currentLocation
            : nearestLocation;
    });
}

export function StandlLocationsSection({
    locations,
    canEdit,
    standlId,
}: StandlLocationsSectionProps) {
    const { userLocation } = useUserLocation();
    const currentTime = useCurrentTime();

    const initialLocationId = useMemo(() => {
        if (locations.length === 0) {
            return null;
        }

        const openLocations = locations.filter(
            (location) =>
                getLocationOpeningStatus(
                    location,
                    currentTime
                ).type === "open"
        );

        if (openLocations.length > 0) {
            return getNearestLocation(
                openLocations,
                userLocation
            ).id;
        }

        const opensLaterLocations = locations.filter(
            (location) =>
                getLocationOpeningStatus(
                    location,
                    currentTime
                ).type === "opensLater"
        );

        if (opensLaterLocations.length > 0) {
            return getNearestLocation(
                opensLaterLocations,
                userLocation
            ).id;
        }

        return getNearestLocation(
            locations,
            userLocation
        ).id;
    }, [locations, userLocation, currentTime]);

    const [expandedLocationId, setExpandedLocationId] =
        useState<string | null>(initialLocationId);

    useEffect(() => {
        setExpandedLocationId(initialLocationId);
    }, [initialLocationId]);

    if (locations.length === 0) {
        return (
            <View style={styles.section}>
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
                        canEdit={canEdit}
                        standlId={standlId}
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