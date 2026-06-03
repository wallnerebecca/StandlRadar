import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/colors";

type PrimaryButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
};

export function PrimaryButton({
    label,
    onPress,
    disabled = false,
    icon,
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
            <View style={styles.content}>
                {icon ? (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={Theme.textPrimary}
                        style={styles.icon}
                    />
                ) : null}

                <Text style={styles.label}>{label}</Text>
            </View>
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
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    icon: {
        marginTop: 1,
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