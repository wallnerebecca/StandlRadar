import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";
import { routes } from "@/lib/routes";
import type { Standl } from "@/types/standl";

type OwnerStandlLocationsSectionProps = {
    standl: Standl;
};

export function OwnerStandlLocationsSection({
    standl,
}: OwnerStandlLocationsSectionProps) {
    const locations = standl.locations ?? [];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Standorte</Text>

            {locations.length > 0 ? (
                <View style={styles.locationList}>
                    {locations.map((location) => {
                        const hasSchedules =
                            (location.schedules ?? []).length > 0;

                        return (
                            <View
                                key={location.id}
                                style={styles.locationCard}
                            >
                                <View>
                                    <Text style={styles.locationTitle}>
                                        {location.locationName ||
                                            "Unbenannter Standort"}
                                    </Text>

                                    <Text style={styles.locationText}>
                                        {[location.postalCode, location.city]
                                            .filter(Boolean)
                                            .join(" ")}
                                    </Text>
                                </View>

                                <View style={styles.locationActions}>
                                    <SecondaryButton
                                        label="Standort bearbeiten"
                                        onPress={() =>
                                            router.push(
                                                routes.editStandlLocation(
                                                    standl.id,
                                                    location.id
                                                )
                                            )
                                        }
                                    />

                                    <SecondaryButton
                                        label={
                                            hasSchedules
                                                ? "Standzeiten bearbeiten"
                                                : "Standzeit hinzufügen"
                                        }
                                        onPress={() =>
                                            router.push(
                                                routes.newStandlSchedule(
                                                    standl.id,
                                                    location.id
                                                )
                                            )
                                        }
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Text style={styles.emptyText}>
                    Für dieses Standl sind noch keine Standorte eingetragen.
                </Text>
            )}

            <SecondaryButton
                label="Standort hinzufügen"
                onPress={() =>
                    router.push(routes.newStandlLocation(standl.id))
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "800",
    },
    locationList: {
        gap: 12,
    },
    locationCard: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },
    locationTitle: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
    },
    locationText: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginTop: 3,
    },
    locationActions: {
        gap: 10,
    },
    emptyText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});
