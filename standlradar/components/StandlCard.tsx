import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "@/constants/colors";

type StandlCategory = "hendl" | "steckerlfisch";

type StandlCardProps = {
    name: string;
    category: StandlCategory;
    location: string;
    status: string;
    likes: number;
    onPress: () => void;
};

export function StandlCard({
    name,
    category,
    location,
    status,
    likes,
    onPress,
}: StandlCardProps) {
    const icon = category === "hendl" ? "🍗" : "🐟";
    const likeLabel = category === "hendl" ? "Hendl-Likes" : "Fisch-Likes";

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.iconBox}>
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.meta}>{location}</Text>
                <Text style={styles.status}>{status}</Text>
                <Text style={styles.likes}>
                    {likes} {likeLabel}
                </Text>
            </View>
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
        gap: 14,
    },
    pressed: {
        opacity: 0.85,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 16,
        backgroundColor: Theme.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        fontSize: 28,
    },
    content: {
        flex: 1,
    },
    name: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    meta: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginBottom: 6,
    },
    status: {
        color: Theme.success,
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 6,
    },
    likes: {
        color: Theme.accent,
        fontSize: 13,
        fontWeight: "600",
    },
});