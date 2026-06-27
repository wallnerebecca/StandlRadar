import { Pressable, StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/colors";
import type { StandlCategory } from "@/types/standl";

export type StandlCategorySelectorProps = {
    category: StandlCategory;
    onChangeCategory: (category: StandlCategory) => void;
};

export function StandlCategorySelector({
    category,
    onChangeCategory,
}: StandlCategorySelectorProps) {
    return (
        <View style={styles.categoryBox}>
            <Text style={styles.label}>Kategorie</Text>

            <View style={styles.categoryButtons}>
                <Pressable
                    onPress={() => onChangeCategory("hendl")}
                    style={[
                        styles.categoryButton,
                        category === "hendl" && styles.categoryButtonActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.categoryButtonText,
                            category === "hendl" && styles.categoryButtonTextActive,
                        ]}
                    >
                        Hendl
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => onChangeCategory("steckerlfisch")}
                    style={[
                        styles.categoryButton,
                        category === "steckerlfisch" && styles.categoryButtonActive,
                    ]}
                >
                    <Text
                        style={[
                            styles.categoryButtonText,
                            category === "steckerlfisch" &&
                            styles.categoryButtonTextActive,
                        ]}
                    >
                        Steckerlfisch
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categoryBox: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    categoryButtons: {
        gap: 8,
    },
    categoryButton: {
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 12,
    },
    categoryButtonActive: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    categoryButtonText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "700",
    },
    categoryButtonTextActive: {
        color: Theme.textPrimary,
    },
});