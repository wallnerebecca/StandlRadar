import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { InfoRow } from "@/components/standl/InfoRow";
import { Theme } from "@/constants/colors";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { calculateDistanceKm } from "@/lib/calculateDistance";
import { formatFullAddress } from "@/lib/formatStandlAddress";
import { formatDistance } from "@/lib/formatDistance";
import { openNavigation } from "@/lib/openNavigation";
import { formatWeekday } from "@/lib/formatWeekday";
import { getLocationOpeningStatus } from "@/lib/getLocationOpeningStatus";
import type { StandlLocation } from "@/types/standlLocation";

import { router } from "expo-router";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { routes } from "@/lib/routes";

type StandlLocationCardProps = {
    location: StandlLocation;
    index: number;
    isExpanded: boolean;
    canEdit?: boolean;
    standlId: string;
    onToggle: () => void;
};

export function StandlLocationCard({
    location,
    index,
    isExpanded,
    canEdit = false,
    standlId,
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

    const sortedSchedules = [...(location.schedules ?? [])].sort(
        (firstSchedule, secondSchedule) => {
            if (firstSchedule.weekday !== secondSchedule.weekday) {
                return firstSchedule.weekday - secondSchedule.weekday;
            }

            return firstSchedule.startTime.localeCompare(
                secondSchedule.startTime
            );
        }
    );

    const hasSchedules = (location.schedules ?? []).length > 0;
    const openingStatus = getLocationOpeningStatus(location);

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
                    <View style={styles.statusRow}>
                        <Text
                            style={[
                                styles.statusText,
                                openingStatus.type === "open" && styles.statusOpen,
                                openingStatus.type === "opensLater" && styles.statusWarning,
                                openingStatus.type === "closed" && styles.statusClosed,
                                openingStatus.type === "unknown" && styles.statusUnknown,
                            ]}
                        >
                            {openingStatus.label}
                        </Text>
                    </View>
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

                    <View style={styles.scheduleSection}>
                        <Text style={styles.scheduleTitle}>Standzeiten</Text>

                        {sortedSchedules.length > 0 ? (
                            <View style={styles.scheduleList}>
                                {sortedSchedules.map((schedule) => (
                                    <View
                                        key={schedule.id}
                                        style={styles.scheduleRow}
                                    >
                                        <Text style={styles.scheduleDay}>
                                            {formatWeekday(schedule.weekday)}
                                        </Text>

                                        <Text style={styles.scheduleTime}>
                                            {schedule.startTime}–{schedule.endTime}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.emptyScheduleText}>
                                Für diesen Standort sind noch keine Standzeiten eingetragen.
                            </Text>
                        )}
                    </View>

                    {canEdit ? (
                        <SecondaryButton
                            label={
                                hasSchedules
                                    ? "Standzeiten ändern"
                                    : "Standzeit hinzufügen"
                            }
                            onPress={() =>
                                router.push(
                                    routes.newStandlSchedule(
                                        standlId,
                                        location.id
                                    )
                                )
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
    scheduleSection: {
        gap: 10,
    },
    scheduleTitle: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "800",
    },
    scheduleList: {
        gap: 8,
    },
    scheduleRow: {
        backgroundColor: Theme.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    scheduleDay: {
        color: Theme.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    scheduleTime: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
    emptyScheduleText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    statusRow: {
        marginBottom: 2,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "800",
    },
    statusOpen: {
        color: Theme.success,
    },
    statusWarning: {
        color: Theme.warning,
    },
    statusClosed: {
        color: Theme.error,
    },
    statusUnknown: {
        color: Theme.textSecondary,
    },
});