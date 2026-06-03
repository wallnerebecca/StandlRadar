import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "@/constants/colors";

type SecondaryButtonProps = {
    label: string;
    onPress: () => void;
};

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        alignItems: "center",
    },
    pressed: {
        opacity: 0.8,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "600",
    },
});