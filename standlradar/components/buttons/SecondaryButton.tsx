import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "@/constants/colors";

type SecondaryButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

export function SecondaryButton({ label, onPress, disabled = false }: SecondaryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            <Text style={[styles.label, disabled && styles.disabledLabel,]}>{label}</Text>
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
    disabled: {
        opacity: 0.5,
    },
    disabledLabel: {
        opacity: 0.8,
    }
});