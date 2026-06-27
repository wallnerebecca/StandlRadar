import { StyleSheet, TextInput, View } from "react-native";

import { StandlCategorySelector } from "@/components/standlForm/StandlCategorySelector";
import { Theme } from "@/constants/colors";
import type { StandlCategory } from "@/types/standl";

type StandlBasicInfoFormProps = {
    name: string;
    onChangeName: (name: string) => void;
    category: StandlCategory;
    onChangeCategory: (category: StandlCategory) => void;
};

export function StandlBasicInfoForm({
    name,
    onChangeName,
    category,
    onChangeCategory,
}: StandlBasicInfoFormProps) {
    return (
        <View style={styles.container}>
            <TextInput
                value={name}
                onChangeText={onChangeName}
                placeholder="Name des Standl"
                placeholderTextColor={Theme.textSecondary}
                style={styles.input}
            />

            <StandlCategorySelector
                category={category}
                onChangeCategory={onChangeCategory}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    input: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        color: Theme.textPrimary,
        fontSize: 16,
    },
});