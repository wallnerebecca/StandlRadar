import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "@/constants/colors";

type InfoRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
};

export function InfoRow({ icon, label, value, onPress }: InfoRowProps) {
    const content = (
        <View style={styles.row}>
            <View style={styles.iconBox}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={Theme.accent}
                />
            </View>

            <View style={styles.textBox}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>

            {onPress ? (
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Theme.textSecondary}
                />
            ) : null}
        </View>
    );

    if (!onPress) {
        return content;
    }


    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressed,
            ]}
        >
            {content}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: Theme.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    textBox: {
        flex: 1,
    },
    label: {
        color: Theme.textSecondary,
        fontSize: 13,
        marginBottom: 2,
    },
    value: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    pressable: {
        borderRadius: 16,
    },
    pressed: {
        opacity: 0.8,
    },
});