import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { InfoRow } from "@/components/InfoRow";
import { ImageFavoriteButton } from "@/components/ImageFavoriteButton";
import { OpeningStatusBadge } from "@/components/OpeningStatusBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { Theme } from "@/constants/colors";
import { mockStandl } from "@/constants/mockStandl";
import { CategoryLikeButton } from "@/components/CategoryLikeButton";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function StandlDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string; }>();

    const standl = mockStandl.find((item) => item.id === id);

    if (!standl) {
        return (
            <View style={styles.notFoundContainer}>
                <Text style={styles.notFoundTitle}>Standl nicht gefunden</Text>
                <Text style={styles.notFoundText}>
                    Dieses Standl gibt es in den Mock-Daten nicht.
                </Text>

                <PrimaryButton
                    label="Zurück zum Radar"
                    onPress={() => router.replace("/(tabs)/radar")}
                />
            </View>
        );
    }

    const { isFavorite, toggleFavorite } = useFavorites();
    const favoriteActive = isFavorite(standl.id);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(standl.likes);

    function handleLikePress() {
        if (liked) {
            setLiked(false);
            setLikeCount((current) => current - 1);
            return;
        }

        setLiked(true);
        setLikeCount((current) => current + 1);
    }

    const categoryLabel =
        standl.category === "hendl" ? "Hendlgriller" : "Steckerlfisch";

    const categoryIcon = standl.category === "hendl" ? "🍗" : "🐟";


    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.topBar}>
                <SecondaryButton label="Zurück" onPress={() => router.back()} />
            </View>

            <View style={styles.imageWrapper}>
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageIcon}>{categoryIcon}</Text>
                    <Text style={styles.imageText}>Standardbild · {categoryLabel}</Text>
                </View>

                <View style={styles.floatingFavorite}>
                    <ImageFavoriteButton
                        active={favoriteActive}
                        onPress={() => toggleFavorite(standl.id)}
                    />
                </View>

                <View style={styles.floatingLike}>
                    <CategoryLikeButton
                        category={standl.category}
                        count={likeCount}
                        liked={liked}
                        onPress={handleLikePress}
                    />
                </View>
            </View>

            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{standl.name}</Text>

                    {standl.isClaimed ? (
                        <View style={styles.claimedBadge}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={15}
                                color={Theme.textPrimary}
                            />
                            <Text style={styles.claimedText}>Bestätigt</Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.subtitle}>
                    {categoryLabel} · {standl.city}
                </Text>
            </View>

            <OpeningStatusBadge
                type={standl.openingStatus.type}
                label={standl.openingStatus.label}
                source={standl.openingStatus.source}
            />

            <View style={styles.infoList}>
                <InfoRow
                    icon="location-outline"
                    label="Standort"
                    value={`${standl.locationName}, ${standl.postalCode} ${standl.city}`}
                />

                <InfoRow
                    icon="navigate-outline"
                    label="Entfernung"
                    value={
                        standl.distanceKm
                            ? `${standl.distanceKm} km entfernt`
                            : "Keine Entfernung verfügbar"
                    }
                />
            </View>


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Standzeiten</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {standl.openingStatus.source === "owner"
                            ? "Besitzer-bestätigte Zeit"
                            : standl.openingStatus.source === "community"
                                ? "Community-Zeit"
                                : "Keine Standzeit bekannt"}
                    </Text>

                    <Text style={styles.cardText}>
                        {standl.openingStatus.source === "owner"
                            ? "Diese Zeit wurde vom Standl bestätigt."
                            : standl.openingStatus.source === "community"
                                ? "Diese Zeit wurde von der Community vorgeschlagen und ist noch nicht bestätigt."
                                : "Für dieses Standl wurde noch keine Standzeit eingetragen."}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preisliste</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Noch keine Preise eingetragen</Text>
                    <Text style={styles.cardText}>
                        Besitzer*innen können später Produktname, Preis und Beschreibung
                        ergänzen.
                    </Text>
                </View>
            </View>

            <View style={styles.actionGrid}>
                <PrimaryButton
                    label={favoriteActive ? "Favorit entfernen" : "Favorit speichern"}
                    icon={favoriteActive ? "heart-dislike-outline" : "heart-outline"}
                    onPress={() => toggleFavorite(standl.id)}
                />

                <SecondaryButton
                    label="Standzeit vorschlagen"
                    onPress={() => console.log("Standzeit vorschlagen:", standl.id)}
                />

                <SecondaryButton
                    label="Problem melden"
                    onPress={() => console.log("Problem melden:", standl.id)}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    content: {
        padding: 24,
        paddingTop: 56,
        paddingBottom: 40,
    },
    topBar: {
        alignSelf: "flex-start",
        marginBottom: 18,
    },
    imagePlaceholder: {
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 24,
        minHeight: 210,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 22,
    },
    imageIcon: {
        fontSize: 56,
        marginBottom: 10,
    },
    imageText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        marginBottom: 18,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 6,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 30,
        fontWeight: "800",
        flex: 1,
    },
    subtitle: {
        color: Theme.textSecondary,
        fontSize: 16,
    },
    claimedBadge: {
        backgroundColor: Theme.success,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
        flexDirection: "row",
        gap: 4,
        alignItems: "center",
    },
    claimedText: {
        color: Theme.textPrimary,
        fontSize: 12,
        fontWeight: "800",
    },
    infoList: {
        gap: 10,
        marginTop: 18,
        marginBottom: 22,
    },
    actionGrid: {
        gap: 10,
        marginBottom: 28,
    },
    section: {
        marginBottom: 22,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 12,
    },
    card: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
    },
    cardTitle: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 6,
    },
    cardText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    notFoundContainer: {
        flex: 1,
        backgroundColor: Theme.background,
        padding: 24,
        justifyContent: "center",
        gap: 16,
    },
    notFoundTitle: {
        color: Theme.textPrimary,
        fontSize: 26,
        fontWeight: "800",
    },
    notFoundText: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    imageWrapper: {
        position: "relative",
        marginBottom: 22,
    },
    floatingFavorite: {
        position: "absolute",
        left: 8,
        bottom: 30,
        zIndex: 10,
    },
    floatingLike: {
        position: "absolute",
        right: 8,
        bottom: 30,
        zIndex: 10,
    },
});