import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";

import { useCanEditStandl } from "@/hooks/useCanEditStandl";

import { OwnerStandlOption } from "@/components/owner/OwnerStandlOption";
import { ScreenState } from "@/components/layout/ScreenState";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ImageFavoriteButton } from "@/components/buttons/ImageFavoriteButton";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { CategoryLikeButton } from "@/components/buttons/CategoryLikeButton";
import { StandlLocationsSection } from "@/components/standl/StandlLocationsSection";

import { Theme } from "@/constants/colors";

import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";


import {
    claimStandlInFirestore,
    getSingleStandlFromFirestore,
    hasUserLikedStandl,
    toggleStandlLike,
} from "@/lib/standlService";
import { routes } from "@/lib/routes";

import type { Standl } from "@/types/standl";

export default function StandlDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string; }>();

    const [standl, setStandl] = useState<Standl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");


    useFocusEffect(
        useCallback(() => {
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
        }, [id])
    );


    if (isLoading) {
        return (
            <ScreenState message="Standl wird geladen..." />
        );
    }

    if (errorMessage) {
        return (
            <ScreenState
                title="Fehler"
                message={errorMessage}
                primaryActionLabel="Zurück zum Radar"
                onPrimaryAction={() => router.replace(routes.radar)}
            />
        );
    }

    if (!standl) {
        return (
            <ScreenState
                title="Standl nicht gefunden"
                message="Dieses Standl wurde nicht in der Datenbank gefunden."
                primaryActionLabel="Zurück zum Radar"
                onPrimaryAction={() =>
                    router.replace(routes.radar)
                }
            />
        );
    }


    return (
        <StandlDetailContent
            standl={standl}
            onStandlChange={setStandl}
        />
    );
}

function StandlDetailContent({
    standl,
    onStandlChange
}: {
    standl: Standl;
    onStandlChange: (standl: Standl) => void;
}) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user, userProfile } = useAuth();


    const favoriteActive = isFavorite(standl.id);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(standl.likes);
    const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);

    const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
    const [claimErrorMessage, setClaimErrorMessage] = useState("");

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

    const canEditStandl = useCanEditStandl(standl);

    const editButton = (
        <OwnerStandlOption standl={standl}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Standl bearbeiten"
                onPress={() => router.push(routes.standlEdit(standl.id))}
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
        </OwnerStandlOption>
    );

    async function handleLikePress() {
        if (!user) {
            router.push(routes.login);
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

    async function handleClaimStandl() {
        setClaimErrorMessage("");

        if (!user) {
            router.push(routes.login);
            return;
        }

        if (standl.isClaimed || isClaimSubmitting) {
            return;
        }

        setIsClaimSubmitting(true);

        try {
            await claimStandlInFirestore(standl.id, user.uid);

            onStandlChange({
                ...standl,
                isClaimed: true,
                ownerId: user.uid,
            });
        } catch (error) {
            console.warn("Standl konnte nicht übernommen werden:", error);
            setClaimErrorMessage(
                "Dieses Standl konnte nicht übernommen werden."
            );
        } finally {
            setIsClaimSubmitting(false);
        }
    }

    const categoryLabel =
        standl.category === "hendl" ? "Hendlgriller" : "Steckerlfisch";

    const categoryIcon = standl.category === "hendl" ? "🍗" : "🐟";

    return (
        <ScreenContainer
            contentStyle={styles.content}
            floatingContent={editButton}
        >

            {canEditStandl ? (
                <View style={styles.topBar}>
                    <SecondaryButton
                        label="Zu meine Standl"
                        onPress={() => router.replace(routes.owner)}
                    />
                </View>
            ) : null}

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
                            <Text style={styles.claimedText}>Offiziell</Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.subtitle}>
                    {categoryLabel}
                    {standl.locations?.length
                        ? ` · ${standl.locations.length} ${standl.locations.length === 1 ? "Standort" : "Standorte"
                        }`
                        : ""}
                </Text>
            </View>


            <StandlLocationsSection
                locations={standl.locations ?? []}
                canEdit={canEditStandl}
                standlId={standl.id}
            />

            <OwnerStandlOption standl={standl}>
                <View style={styles.ownerLocationActions}>
                    <SecondaryButton
                        label="Standort hinzufügen"
                        onPress={() =>
                            router.push(
                                routes.newStandlLocation(standl.id)
                            )
                        }
                    />
                </View>
            </OwnerStandlOption>

            <View style={styles.actionGrid}>
                <PrimaryButton
                    label={favoriteActive ? "Favorit entfernen" : "Favorit speichern"}
                    icon={favoriteActive ? "heart-dislike-outline" : "heart-outline"}
                    onPress={() => toggleFavorite(standl.id)}
                />

                {/*                 <SecondaryButton
                    label="Standzeit vorschlagen"
                    onPress={() => console.log("Standzeit vorschlagen:", standl.id)}
                />

                <SecondaryButton
                    label="Problem melden"
                    onPress={() => console.log("Problem melden:", standl.id)}
                /> */}

                {!standl.isClaimed && userProfile?.role === "owner" ? (
                    <View style={styles.claimBox}>
                        <Text style={styles.claimTitle}>
                            Gehört dieses Standl dir?
                        </Text>

                        <Text style={styles.claimText}>
                            Du kannst dieses noch nicht übernommene Standl übernehmen und danach bearbeiten.
                        </Text>

                        {claimErrorMessage ? (
                            <Text style={styles.errorText}>
                                {claimErrorMessage}
                            </Text>
                        ) : null}

                        <PrimaryButton
                            label={
                                isClaimSubmitting
                                    ? "Standl wird übernommen..."
                                    : "Standl übernehmen"
                            }
                            onPress={handleClaimStandl}
                            disabled={isClaimSubmitting}
                        />
                    </View>
                ) : null}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 20,
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
    actionGrid: {
        gap: 10,
        marginBottom: 28,
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
    editButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.96 }],
    },
    ownerLocationActions: {
        marginTop: -10,
        marginBottom: 18,
    },
    claimBox: {
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        gap: 10,
        marginBottom: 18,
        marginTop: 10,
    },
    claimTitle: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
    },
    claimText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});
