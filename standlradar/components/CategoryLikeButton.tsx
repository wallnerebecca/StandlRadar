import { Pressable, StyleSheet, Text } from "react-native";

import { Theme } from "@/constants/colors";
import type { StandlCategory } from "@/types/standl";

type CategoryLikeButtonProps = {
    category: StandlCategory;
    count: number;
    liked: boolean;
    onPress: () => void;
};

export function CategoryLikeButton({
    category,
    count,
    liked,
    onPress,
}: CategoryLikeButtonProps) {
    const icon = category === "hendl" ? "🍗" : "🐟";

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                liked && styles.buttonLiked,
                pressed && styles.pressed,
            ]}
        >
            <Text style={[styles.icon, !liked && styles.iconMuted]}>{icon}</Text>
            <Text style={[styles.count, liked && styles.countLiked]}>{count}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "rgba(35, 29, 26, 0.88)",
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 13,
        paddingVertical: 8,
    },
    buttonLiked: {
        borderColor: Theme.secondary,
        backgroundColor: "rgba(199, 90, 27, 0.16)",
    },
    pressed: {
        opacity: 0.8,
    },
    icon: {
        fontSize: 20,
    },
    iconMuted: {
        opacity: 0.38,
    },
    count: {
        color: Theme.textSecondary,
        fontSize: 15,
        fontWeight: "800",
    },
    countLiked: {
        color: Theme.textPrimary,
    },
});