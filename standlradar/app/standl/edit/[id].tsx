import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ScreenState } from "@/components/layout/ScreenState";
import { FormScreen } from "@/components/layout/FormScreen";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";

import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

import {
    getSingleStandlFromFirestore,
    updateOwnerStandlBaseInfoInFirestore,
} from "@/lib/standlService";
import { routes } from "@/lib/routes";

import type { Standl } from "@/types/standl";

export default function EditStandlScreen() {
    const { id } = useLocalSearchParams<{ id?: string; }>();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(false);

    const [standl, setStandl] = useState<Standl | null>(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState<Standl["category"]>("hendl");

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadStandl() {
            if (isAuthLoading) {
                return;
            }

            if (!id) {
                setErrorMessage("Es wurde keine Standl-ID übergeben.");
                setIsLoading(false);
                return;
            }

            if (!user) {
                setErrorMessage(
                    "Du musst eingeloggt sein, um ein Standl zu bearbeiten."
                );
                setIsLoading(false);
                return;
            }

            try {
                setErrorMessage("");

                const standl = await getSingleStandlFromFirestore(id);

                if (!standl) {
                    setErrorMessage("Standl wurde nicht gefunden.");
                    return;
                }

                if (standl.ownerId !== user.uid) {
                    setErrorMessage(
                        "Dieses Standl gehört nicht zum eingeloggten Besitzerkonto."
                    );
                    return;
                }

                setCanEdit(true);
                setStandl(standl);

                setName(standl.name);
                setCategory(standl.category);
            } catch (error) {
                console.warn("Standl konnte nicht geladen werden:", error);
                setErrorMessage("Standl konnte nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        }

        loadStandl();
    }, [id, user, isAuthLoading]);



    async function handleUpdateStandl() {
        setErrorMessage("");

        if (!id || !user || !canEdit) {
            setErrorMessage("Das Standl kann nicht bearbeitet werden.");
            return;
        }
        if (name.trim().length < 2) {
            setErrorMessage("Bitte gib einen Namen für das Standl ein.");
            return;
        }


        setIsSubmitting(true);

        try {
            await updateOwnerStandlBaseInfoInFirestore(
                id,
                user.uid,
                {
                    name: name.trim(),
                    category,
                });

            router.replace(routes.standlDetail(id));
        } catch (error) {
            console.warn("Standl konnte nicht aktualisiert werden:", error);
            setErrorMessage("Standl konnte nicht aktualisiert werden.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading || isAuthLoading) {
        return (
            <ScreenState message="Standl wird geladen..." />
        );
    }

    if (!canEdit) {
        return (
            <ScreenState
                title="Bearbeiten nicht möglich"
                message={
                    errorMessage ||
                    "Für dieses Standl fehlen die Berechtigungen."
                }
                primaryActionLabel={!user ? "Einloggen" : undefined}
                onPrimaryAction={
                    !user
                        ? () => router.push(routes.login)
                        : undefined
                }
                secondaryActionLabel="Zurück"
                onSecondaryAction={() => router.back()}
            />
        );
    }

    return (
        <FormScreen
            contentStyle={styles.content}
        >
            <AppHeader
                title="Standl bearbeiten"
                subtitle="Verwalte Standl-Standorte."
            />

            <View style={styles.form}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Allgemeine Informationen</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Name</Text>

                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Name des Standls"
                            placeholderTextColor={Theme.textSecondary}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Kategorie</Text>

                        <View style={styles.categoryRow}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setCategory("hendl")}
                                style={({ pressed }) => [
                                    styles.categoryButton,
                                    category === "hendl" && styles.categoryButtonActive,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        category === "hendl" &&
                                        styles.categoryButtonTextActive,
                                    ]}
                                >
                                    Hendl
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setCategory("steckerlfisch")}
                                style={({ pressed }) => [
                                    styles.categoryButton,
                                    category === "steckerlfisch" &&
                                    styles.categoryButtonActive,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.categoryButtonText,
                                        category === "steckerlfisch" &&
                                        styles.categoryButtonTextActive,
                                    ]}
                                >
                                    Steckerlfisch
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {standl ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Standorte</Text>

                        {(standl.locations ?? []).length > 0 ? (
                            <View style={styles.locationList}>
                                {(standl.locations ?? []).map((location) => {
                                    const hasSchedules =
                                        (location.schedules ?? []).length > 0;

                                    return (
                                        <View
                                            key={location.id}
                                            style={styles.locationCard}
                                        >
                                            <View>
                                                <Text style={styles.locationTitle}>
                                                    {location.locationName ||
                                                        "Unbenannter Standort"}
                                                </Text>

                                                <Text style={styles.locationText}>
                                                    {[location.postalCode, location.city]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                </Text>
                                            </View>

                                            <View style={styles.locationActions}>
                                                <SecondaryButton
                                                    label="Standort bearbeiten"
                                                    onPress={() =>
                                                        router.push(
                                                            routes.editStandlLocation(
                                                                standl.id,
                                                                location.id
                                                            )
                                                        )
                                                    }
                                                />

                                                <SecondaryButton
                                                    label={
                                                        hasSchedules
                                                            ? "Standzeiten bearbeiten"
                                                            : "Standzeit hinzufügen"
                                                    }
                                                    onPress={() =>
                                                        router.push(
                                                            routes.newStandlSchedule(
                                                                standl.id,
                                                                location.id
                                                            )
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>
                                Für dieses Standl sind noch keine Standorte eingetragen.
                            </Text>
                        )}

                        <SecondaryButton
                            label="Standort hinzufügen"
                            onPress={() =>
                                router.push(routes.newStandlLocation(standl.id))
                            }
                        />
                    </View>
                ) : null}

                <PrimaryButton
                    label={
                        isSubmitting
                            ? "Änderungen werden gespeichert..."
                            : "Änderungen speichern"
                    }
                    onPress={handleUpdateStandl}
                    disabled={isSubmitting}
                />

                <SecondaryButton
                    label="Abbrechen"
                    onPress={() => router.back()}
                />
            </View>
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 80,
    },
    form: {
        gap: 12,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "800",
    },
    fieldGroup: {
        gap: 8,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    input: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        color: Theme.textPrimary,
        fontSize: 16,
    },
    categoryRow: {
        flexDirection: "row",
        gap: 10,
    },
    categoryButton: {
        flex: 1,
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 13,
        alignItems: "center",
    },
    categoryButtonActive: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    categoryButtonText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "700",
    },
    categoryButtonTextActive: {
        color: Theme.textPrimary,
    },
    pressed: {
        opacity: 0.8,
    },
    locationList: {
        gap: 12,
    },
    locationCard: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },
    locationTitle: {
        color: Theme.textPrimary,
        fontSize: 16,
        fontWeight: "800",
    },
    locationText: {
        color: Theme.textSecondary,
        fontSize: 14,
        marginTop: 3,
    },
    locationActions: {
        gap: 10,
    },
    emptyText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});