import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { FormScreen } from "@/components/layout/FormScreen";
import { ScreenState } from "@/components/layout/ScreenState";
import { StandlLocationInput } from "@/components/standlForm/StandlLocationInput";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useStandlLocationForm } from "@/hooks/useStandlLocationForm";
import { createStandlLocation } from "@/lib/standlLocationService";
import { getSingleStandlFromFirestore } from "@/lib/standlService";
import { routes } from "@/lib/routes";

export default function NewStandlLocationScreen() {
    const { id } = useLocalSearchParams<{ id?: string; }>();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canAddLocation, setCanAddLocation] = useState(false);

    const locationForm = useStandlLocationForm(setErrorMessage);

    useEffect(() => {
        async function checkPermission() {
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
                    "Du musst eingeloggt sein, um einen Standort hinzuzufügen."
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
                        "Du kannst nur Standorte zu deinen eigenen Standl hinzufügen."
                    );
                    return;
                }

                setCanAddLocation(true);
            } catch (error) {
                console.warn(
                    "Standl konnte nicht geprüft werden:",
                    error
                );
                setErrorMessage("Standl konnte nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        }

        checkPermission();
    }, [id, user, isAuthLoading]);

    function validateLocation() {
        if (locationForm.locationInputMode === "address") {
            if (locationForm.street.trim().length < 2) {
                setErrorMessage("Bitte gib eine Straße ein.");
                return false;
            }

            if (locationForm.postalCode.trim().length < 3) {
                setErrorMessage("Bitte gib eine PLZ ein.");
                return false;
            }

            if (locationForm.city.trim().length < 2) {
                setErrorMessage("Bitte gib einen Ort ein.");
                return false;
            }
        }

        if (!locationForm.selectedLocation) {
            setErrorMessage(
                locationForm.locationInputMode === "address"
                    ? "Bitte suche die Adresse oder setze den Standort auf der Karte."
                    : "Bitte wähle einen Standort auf der Karte aus."
            );
            return false;
        }

        return true;
    }

    async function handleCreateLocation() {
        setErrorMessage("");

        if (!id || !user || !canAddLocation) {
            setErrorMessage(
                "Der Standort kann nicht hinzugefügt werden."
            );
            return;
        }

        if (!validateLocation()) {
            return;
        }

        if (!locationForm.selectedLocation) {
            return;
        }

        setIsSubmitting(true);

        try {
            await createStandlLocation({
                standlId: id,
                locationName: locationForm.locationName.trim(),
                street: locationForm.street.trim(),
                streetNumber: locationForm.streetNumber.trim(),
                postalCode: locationForm.postalCode.trim(),
                city: locationForm.city.trim(),
                latitude: locationForm.selectedLocation.latitude,
                longitude: locationForm.selectedLocation.longitude,
                source: "owner",
                status: "verified",
                createdBy: user.uid,
            });

            router.replace(routes.standlDetail(id));
        } catch (error) {
            console.warn(
                "Standort konnte nicht erstellt werden:",
                error
            );
            setErrorMessage(
                "Standort konnte nicht gespeichert werden."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading || isAuthLoading) {
        return (
            <ScreenState message="Standl wird geladen..." />
        );
    }

    if (!canAddLocation) {
        return (
            <ScreenState
                title="Standort hinzufügen nicht möglich"
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
            scrollRef={locationForm.scrollViewRef}
            contentStyle={styles.content}
        >
            <Text style={styles.title}>Standort hinzufügen</Text>

            <Text style={styles.subtitle}>
                Lege einen weiteren regelmäßigen Standort für dein Standl an.
            </Text>

            <View style={styles.form}>
                <StandlLocationInput
                    locationInputMode={locationForm.locationInputMode}
                    onChangeLocationInputMode={
                        locationForm.handleLocationInputModeChange
                    }
                    locationName={locationForm.locationName}
                    onChangeLocationName={locationForm.setLocationName}
                    street={locationForm.street}
                    onChangeStreet={locationForm.setStreet}
                    streetNumber={locationForm.streetNumber}
                    onChangeStreetNumber={
                        locationForm.setStreetNumber
                    }
                    postalCode={locationForm.postalCode}
                    onChangePostalCode={
                        locationForm.setPostalCode
                    }
                    city={locationForm.city}
                    onChangeCity={locationForm.setCity}
                    selectedLocation={
                        locationForm.selectedLocation
                    }
                    mapRegion={locationForm.mapRegion}
                    onChangeMapRegion={
                        locationForm.setMapRegion
                    }
                    onMapPress={locationForm.handleMapPress}
                    isSearchingAddress={
                        locationForm.isSearchingAddress
                    }
                    onSearchAddress={
                        locationForm.handleSearchAddress
                    }
                />

                {errorMessage ? (
                    <Text style={styles.errorText}>
                        {errorMessage}
                    </Text>
                ) : null}

                <PrimaryButton
                    label={
                        isSubmitting
                            ? "Standort wird gespeichert..."
                            : "Standort speichern"
                    }
                    onPress={handleCreateLocation}
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
    title: {
        color: Theme.textPrimary,
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 8,
    },
    subtitle: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    form: {
        gap: 12,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});