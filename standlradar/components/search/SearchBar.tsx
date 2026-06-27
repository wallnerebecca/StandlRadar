import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "@/constants/colors";

type SearchBarProps = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
};

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Standl, Ort oder PLZ suchen",
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Ionicons name="search-outline" size={20} color={Theme.textSecondary} />

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Theme.textSecondary}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    input: {
        flex: 1,
        color: Theme.textPrimary,
        fontSize: 16,
    },
});