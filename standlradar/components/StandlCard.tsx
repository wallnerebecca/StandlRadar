import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "@/constants/colors";
import type { Standl } from "@/types/standl";

type StandlCardProps = {
    standl: Standl;
    isFavorite?: boolean;
    onPress: () => void;
};

export function StandlCard({ standl, isFavorite = false, onPress }: StandlCardProps) {
    const icon = standl.category === "hendl" ? "🍗" : "🐟";
    const categoryLabel =
        standl.category === "hendl" ? "Hendlgriller" : "Steckerlfisch";
    const likeLabel =
        standl.category === "hendl" ? "Hendl-Likes" : "Fisch-Likes";

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.iconBox}>
                <Text style={styles.icon}>{icon}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.name}>{standl.name}</Text>
                    {isFavorite ? (
                        <Ionicons
                            name="heart"
                            size={18}
                            color={Theme.secondary}
                        />
                    ) : null}

                    {standl.isClaimed ? (
                        <Text style={styles.claimedBadge}>Bestätigt</Text>
                    ) : null}
                </View>

                <Text style={styles.meta}>
                    {categoryLabel} · {standl.city}
                </Text>

                <Text style={styles.location}>{standl.locationName}</Text>

                <Text
                    style={[
                        styles.status,
                        ["likelyOpen", "opensLater"].includes(standl.openingStatus.type) &&
                        styles.warning,
                        ["closed", "temporaryClosed"].includes(standl.openingStatus.type) &&
                        styles.error,
                        standl.openingStatus.type === "unknown" && styles.neutral,
                    ]}
                >
                    {standl.openingStatus.label}
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.likes}>
                        {standl.likes} {likeLabel}
                    </Text>

                    {standl.distanceKm ? (
                        <Text style={styles.distance}>{standl.distanceKm} km</Text>
                    ) : null}
                </View>
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
    titleRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        marginBottom: 4,
    },
    name: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
    },
    claimedBadge: {
        color: Theme.textPrimary,
        backgroundColor: Theme.success,
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: "hidden",
    },
    meta: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    location: {
        color: Theme.textSecondary,
        fontSize: 13,
        marginBottom: 8,
    },
    status: {
        color: Theme.success,
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 8,
    },
    warning: {
        color: Theme.warning,
    },
    error: {
        color: Theme.error,
    },
    neutral: {
        color: Theme.textSecondary,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    likes: {
        color: Theme.accent,
        fontSize: 13,
        fontWeight: "600",
    },
    distance: {
        color: Theme.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
});