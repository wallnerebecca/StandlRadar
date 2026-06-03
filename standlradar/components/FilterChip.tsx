import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "@/constants/colors";

type FilterChipProps = {
    label: string;
    selected?: boolean;
    onPress: () => void;
};

export function FilterChip({
    label,
    selected = false,
    onPress,
}: FilterChipProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.chip,
                selected && styles.selected,
                pressed && styles.pressed,
            ]}
        >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
    },
    selected: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    pressed: {
        opacity: 0.8,
    },
    label: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
    selectedLabel: {
        color: Theme.textPrimary,
    },
});