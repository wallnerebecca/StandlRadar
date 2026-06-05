import { StyleSheet, View } from "react-native";

import { FilterChip } from "@/components/buttons/FilterChip";
import type { CategoryFilter } from "@/lib/filterStandl";


type StandlFilterChipsProps = {
    selectedCategory: CategoryFilter;
    onChangeCategory: (category: CategoryFilter) => void;
    showOpenOnly: boolean;
    onToggleOpenOnly: () => void;
};

export function StandlFilterChips({
    selectedCategory,
    onChangeCategory,
    showOpenOnly,
    onToggleOpenOnly,
}: StandlFilterChipsProps) {
    return (
        <View style={styles.chipRow}>
            <FilterChip
                label="Alle"
                selected={selectedCategory === "all"}
                onPress={() => onChangeCategory("all")}
            />

            <FilterChip
                label="Hendl"
                selected={selectedCategory === "hendl"}
                onPress={() => onChangeCategory("hendl")}
            />

            <FilterChip
                label="Steckerlfisch"
                selected={selectedCategory === "steckerlfisch"}
                onPress={() => onChangeCategory("steckerlfisch")}
            />

            <FilterChip
                label="Jetzt geöffnet"
                selected={showOpenOnly}
                onPress={onToggleOpenOnly}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
});