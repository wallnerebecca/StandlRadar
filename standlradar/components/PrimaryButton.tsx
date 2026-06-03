import { Pressable, StyleSheet, Text } from "react-native";
import { Theme } from "@/constants/colors";

type PrimaryButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

export function PrimaryButton({
    label,
    onPress,
    disabled = false,
}: PrimaryButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
            ]}
        >
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Theme.secondary,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        alignItems: "center",
    },
    pressed: {
        opacity: 0.8,
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
});