import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "@/constants/colors";

type ImageFavoriteButtonProps = {
    active: boolean;
    onPress: () => void;
};

export function ImageFavoriteButton({
    active,
    onPress,
}: ImageFavoriteButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                active && styles.buttonActive,
                pressed && styles.pressed,
            ]}
        >
            <Ionicons
                name={active ? "heart" : "heart-outline"}
                size={23}
                color={active ? Theme.secondary : Theme.textSecondary}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 999,
        backgroundColor: "rgba(35, 29, 26, 0.88)",
        borderColor: Theme.border,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonActive: {
        borderColor: Theme.secondary,
        backgroundColor: "rgba(199, 90, 27, 0.16)",
    },
    pressed: {
        opacity: 0.8,
    },
});