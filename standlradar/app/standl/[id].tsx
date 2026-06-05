import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { InfoRow } from "@/components/InfoRow";
import { ImageFavoriteButton } from "@/components/buttons/ImageFavoriteButton";
import { OpeningStatusBadge } from "@/components/OpeningStatusBadge";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";

import { CategoryLikeButton } from "@/components/buttons/CategoryLikeButton";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
    getSingleStandlFromFirestore,
    hasUserLikedStandl,
    toggleStandlLike,
} from "@/lib/standlService";
import type { Standl } from "@/types/standl";
import { useAuth } from "@/contexts/AuthContext";

export default function StandlDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string; }>();

    const [standl, setStandl] = useState<Standl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
        async function loadStandl() {
            if (!id) {
                setErrorMessage("Keine Standl-ID gefunden.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                setErrorMessage("");

                const firestoreStandl = await getSingleStandlFromFirestore(id);

                setStandl(firestoreStandl);
            } catch (error) {
                console.warn("Standl konnte nicht geladen werden:", error);
                setErrorMessage("Standl konnte nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        }

        loadStandl();
    }, [id]);

    if (isLoading) {
        return (
            <ScreenContainer style={styles.notFoundContainer}>
                <Text style={styles.notFoundTitle}>Standl wird geladen...</Text>
            </ScreenContainer>
        );
    }

    if (errorMessage) {
        return (
            <ScreenContainer style={styles.notFoundContainer}>
                <Text style={styles.notFoundTitle}>Fehler</Text>
                <Text style={styles.notFoundText}>{errorMessage}</Text>

                <PrimaryButton
                    label="Zurück zum Radar"
                    onPress={() => router.replace("/(tabs)/radar")}
                />
            </ScreenContainer>
        );
    }


    if (!standl) {
        return (
            <ScreenContainer style={styles.notFoundContainer}>
                <Text style={styles.notFoundTitle}>Standl nicht gefunden</Text>
                <Text style={styles.notFoundText}>
                    Dieses Standl wurde nicht in der Datenbank gefunden.
                </Text>

                <PrimaryButton
                    label="Zurück zum Radar"
                    onPress={() => router.replace("/(tabs)/radar")}
                />
            </ScreenContainer>
        );
    }

    return <StandlDetailContent standl={standl} />;
}

function StandlDetailContent({ standl }: { standl: Standl; }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAuth();

    const favoriteActive = isFavorite(standl.id);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(standl.likes);
    const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);

    useEffect(() => {
        async function loadLikeStatus() {
            if (!user) {
                setLiked(false);
                setLikeCount(standl.likes);
                return;
            }

            try {
                const userHasLiked = await hasUserLikedStandl(standl.id, user.uid);
                setLiked(userHasLiked);
                setLikeCount(standl.likes);
            } catch (error) {
                console.warn("Like-Status konnte nicht geladen werden:", error);
                setLiked(false);
            }
        }

        loadLikeStatus();
    }, [standl.id, standl.likes, user]);

    const canEditStandl = user?.uid === standl.ownerId;

    const editButton = canEditStandl ? (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Standl bearbeiten"
            onPress={() => router.push(`/standl/edit/${standl.id}`)}
            style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
            ]}
        >
            <Ionicons
                name="pencil"
                size={24}
                color={Theme.textPrimary}
            />
        </Pressable>
    ) : null;

    async function handleLikePress() {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (isLikeSubmitting) {
            return;
        }

        setIsLikeSubmitting(true);

        try {
            const result = await toggleStandlLike(standl.id, user.uid);

            setLiked(result.liked);
            setLikeCount(result.likes);
        } catch (error) {
            console.warn("Like konnte nicht gespeichert werden:", error);
        } finally {
            setIsLikeSubmitting(false);
        }
    }

    const categoryLabel =
        standl.category === "hendl" ? "Hendlgriller" : "Steckerlfisch";

    const categoryIcon = standl.category === "hendl" ? "🍗" : "🐟";

    const addressValue = [
        [standl.street, standl.streetNumber]
            .filter(Boolean)
            .join(" "),
        [standl.postalCode, standl.city]
            .filter(Boolean)
            .join(" "),
    ]
        .filter(Boolean)
        .join(", ");


    return (
        <ScreenContainer
            contentStyle={styles.content}
            floatingContent={editButton}
        >
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
                        disabled={isLikeSubmitting}
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
                    label="Adresse"
                    value={addressValue || "Keine Adresse verfügbar"}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 20,
        paddingBottom: 120,
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
        flexGrow: 1,
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
    editButton: {
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.secondary,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
});