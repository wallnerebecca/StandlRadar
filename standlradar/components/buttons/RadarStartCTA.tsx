import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "@/constants/colors";

type RadarStartCTAProps = {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    variant?: "primary" | "secondary";
};

export function RadarStartCTA({
    title,
    description,
    icon,
    onPress,
    variant = "secondary",
}: RadarStartCTAProps) {
    const isPrimary = variant === "primary";

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                isPrimary && styles.primaryCard,
                pressed && styles.pressed,
            ]}
        >
            <View style={[styles.iconBox, isPrimary && styles.primaryIconBox]}>
                <Ionicons
                    name={icon}
                    size={24}
                    color={isPrimary ? Theme.textPrimary : Theme.accent}
                />
            </View>

            <View style={styles.textBox}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={20}
                color={Theme.textSecondary}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    primaryCard: {
        backgroundColor: Theme.primary,
        borderColor: Theme.primary,
    },
    pressed: {
        opacity: 0.85,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: Theme.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryIconBox: {
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    textBox: {
        flex: 1,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 3,
    },
    description: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
});