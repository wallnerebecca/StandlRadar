import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { Theme } from "@/constants/colors";

type NavigationIconButtonProps = {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    accessibilityLabel?: string;
    isOpen?: boolean;
};

export function NavigationIconButton({
    onPress,
    icon = "navigate-outline",
    accessibilityLabel = "Route öffnen",
    isOpen = false,
}: NavigationIconButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            hitSlop={8}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                isOpen && styles.buttonOpen,
                pressed && styles.buttonPressed,
            ]}
        >
            <Ionicons
                name={icon}
                size={21}
                color={Theme.textPrimary}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Theme.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.96 }],
    },
    buttonOpen: {
        backgroundColor: Theme.success,
    },
});