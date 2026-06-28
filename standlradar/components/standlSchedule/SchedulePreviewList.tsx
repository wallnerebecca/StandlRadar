import { Pressable, StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/colors";
import {
    WEEKDAYS,
    type SchedulePreviewGroup,
} from "@/lib/standlScheduleDraft";
import type { Weekday } from "@/types/standlSchedule";

type SchedulePreviewListProps = {
    groups: SchedulePreviewGroup[];
    onRemove: (weekdays: Weekday[]) => void;
};

export function SchedulePreviewList({
    groups,
    onRemove,
}: SchedulePreviewListProps) {
    return (
        <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Vorschau</Text>

            {groups.length > 0 ? (
                <View style={styles.previewList}>
                    {groups.map((group) => (
                        <View key={group.id} style={styles.previewCard}>
                            <View style={styles.previewText}>
                                <Text style={styles.previewDays}>
                                    {group.weekdays
                                        .map(
                                            (day) =>
                                                WEEKDAYS.find(
                                                    (weekday) =>
                                                        weekday.value === day
                                                )?.shortLabel
                                        )
                                        .filter(Boolean)
                                        .join(", ")}
                                </Text>

                                <Text style={styles.previewTime}>
                                    {group.startTime}–{group.endTime}
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Standzeit aus Vorschau entfernen"
                                onPress={() => onRemove(group.weekdays)}
                                style={({ pressed }) => [
                                    styles.removeButton,
                                    pressed && styles.removeButtonPressed,
                                ]}
                            >
                                <Text style={styles.removeButtonText}>
                                    Entfernen
                                </Text>
                            </Pressable>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.emptyPreviewText}>
                    Noch keine Standzeiten zur Vorschau hinzugefügt.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    previewSection: {
        gap: 10,
    },
    previewTitle: {
        color: Theme.textPrimary,
        fontSize: 17,
        fontWeight: "800",
    },
    previewList: {
        gap: 10,
    },
    previewCard: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    previewText: {
        flex: 1,
        gap: 3,
    },
    previewDays: {
        color: Theme.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    previewTime: {
        color: Theme.textSecondary,
        fontSize: 14,
    },
    removeButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    removeButtonPressed: {
        opacity: 0.7,
    },
    removeButtonText: {
        color: Theme.error,
        fontSize: 13,
        fontWeight: "700",
    },
    emptyPreviewText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});
