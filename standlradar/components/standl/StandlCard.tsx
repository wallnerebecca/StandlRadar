import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useUserLocation } from "@/contexts/UserLocationContext";
import { calculateDistanceKm } from "@/lib/calculateDistance";
import { formatDistance } from "@/lib/formatDistance";
import { openNavigation } from "@/lib/openNavigation";
import { formatStreetAddress } from "@/lib/formatStandlAddress";
import { getStandlDisplayLocation } from "@/lib/getStandlDisplayLocation";
import { getLocationOpeningStatus } from "@/lib/getLocationOpeningStatus";
import { useCurrentTime } from "@/hooks/useCurrentTime";

import { Theme } from "@/constants/colors";
import type { Standl } from "@/types/standl";
import type { StandlLocation } from "@/types/standlLocation";
import { NavigationIconButton } from "@/components/buttons/NavigationIconButton";

type StandlCardProps = {
    standl: Standl;
    location?: StandlLocation;
    isFavorite?: boolean;
    onPress: () => void;
};



export function StandlCard({ standl, location, isFavorite = false, onPress }: StandlCardProps) {
    const icon = standl.category === "hendl" ? "🍗" : "🐟";
    const categoryLabel =
        standl.category === "hendl" ? "Hendlgriller" : "Steckerlfisch";
    const likeLabel =
        standl.category === "hendl" ? "Hendl-Likes" : "Fisch-Likes";

    const currentTime = useCurrentTime();

    const { userLocation } = useUserLocation();
    const displayLocation =
        location ?? getStandlDisplayLocation(
            standl,
            userLocation,
            currentTime,
        );



    const openingStatus = displayLocation
        ? getLocationOpeningStatus(displayLocation, currentTime)
        : null;

    const streetValue = displayLocation
        ? formatStreetAddress(displayLocation)
        : "";

    const distanceKm = userLocation && displayLocation
        ? calculateDistanceKm(userLocation, displayLocation)
        : undefined;


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
                    {categoryLabel}
                    {displayLocation?.city ? ` · ${displayLocation.city}` : ""}
                </Text>

                {streetValue ? (
                    <Text style={styles.location}>
                        {streetValue}
                    </Text>
                ) : null}

                {openingStatus && openingStatus.type !== "unknown" ? (
                    <Text
                        style={[
                            styles.status,
                            openingStatus.type === "opensLater" &&
                            styles.warning,
                            openingStatus.type === "closed" &&
                            styles.error,
                        ]}
                    >
                        {openingStatus.label}
                    </Text>
                ) : null}

                <View style={styles.footer}>
                    <View>
                        <Text style={styles.likes}>
                            {standl.likes} {likeLabel}
                        </Text>

                        {distanceKm !== undefined ? (
                            <Text style={styles.distance}>
                                {formatDistance(distanceKm)}
                            </Text>
                        ) : null}
                    </View>
                    {displayLocation ? (
                        <NavigationIconButton
                            icon="navigate-outline"
                            isOpen={openingStatus?.type === "open"}
                            accessibilityLabel={`Route zu ${standl.name} öffnen`}
                            onPress={() =>
                                openNavigation({
                                    latitude: displayLocation.latitude,
                                    longitude: displayLocation.longitude,
                                })
                            }
                        />
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
    footer: {
        flexDirection: "row",
        alignItems: "center",
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