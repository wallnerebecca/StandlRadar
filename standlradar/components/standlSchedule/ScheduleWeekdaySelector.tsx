import { Pressable, StyleSheet, Text, View } from "react-native";

import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";
import { WEEKDAYS } from "@/lib/standlScheduleDraft";
import type { Weekday } from "@/types/standlSchedule";

type ScheduleWeekdaySelectorProps = {
    selectedWeekdays: Weekday[];
    onToggleWeekday: (weekday: Weekday) => void;
    onToggleAll: () => void;
};

export function ScheduleWeekdaySelector({
    selectedWeekdays,
    onToggleWeekday,
    onToggleAll,
}: ScheduleWeekdaySelectorProps) {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Wochentage</Text>

            <View style={styles.weekdayRow}>
                {WEEKDAYS.map((day) => {
                    const isSelected = selectedWeekdays.includes(day.value);

                    return (
                        <Pressable
                            key={day.value}
                            accessibilityRole="button"
                            accessibilityLabel={day.label}
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => onToggleWeekday(day.value)}
                            style={({ pressed }) => [
                                styles.weekdayButton,
                                isSelected && styles.weekdayButtonSelected,
                                pressed && styles.weekdayButtonPressed,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.weekdayButtonText,
                                    isSelected &&
                                    styles.weekdayButtonTextSelected,
                                ]}
                            >
                                {day.shortLabel}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <SecondaryButton
                label={
                    selectedWeekdays.length === WEEKDAYS.length
                        ? "Alle Tage abwählen"
                        : "Alle Tage auswählen"
                }
                onPress={onToggleAll}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    fieldGroup: {
        gap: 10,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    weekdayRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    weekdayButton: {
        minWidth: 42,
        minHeight: 42,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.border,
        backgroundColor: Theme.card,
        alignItems: "center",
        justifyContent: "center",
    },
    weekdayButtonSelected: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    weekdayButtonPressed: {
        opacity: 0.8,
    },
    weekdayButtonText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "700",
    },
    weekdayButtonTextSelected: {
        color: Theme.textPrimary,
    },
});
