import { Pressable, StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/colors";

type ToggleValue = "search" | "favorites";

type SearchFavoriteToggleProps = {
    value: ToggleValue;
    onChange: (value: ToggleValue) => void;
};

export function SearchFavoriteToggle({
    value,
    onChange,
}: SearchFavoriteToggleProps) {
    return (
        <View style={styles.container}>
            <Pressable
                onPress={() => onChange("search")}
                style={[styles.option, value === "search" && styles.selected]}
            >
                <Text
                    style={[
                        styles.label,
                        value === "search" && styles.selectedLabel,
                    ]}
                >
                    Suchen
                </Text>
            </Pressable>

            <Pressable
                onPress={() => onChange("favorites")}
                style={[styles.option, value === "favorites" && styles.selected]}
            >
                <Text
                    style={[
                        styles.label,
                        value === "favorites" && styles.selectedLabel,
                    ]}
                >
                    Favoriten
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 4,
        flexDirection: "row",
    },
    option: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    selected: {
        backgroundColor: Theme.secondary,
    },
    label: {
        color: Theme.textSecondary,
        fontSize: 15,
        fontWeight: "700",
    },
    selectedLabel: {
        color: Theme.textPrimary,
    },
});