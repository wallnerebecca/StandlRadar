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
import { routes } from "@/lib/routes";
import { updateStandlLocation } from "@/lib/standlLocationService";
import { getSingleStandlFromFirestore } from "@/lib/standlService";

export default function EditStandlLocationScreen() {
    const { id, locationId } = useLocalSearchParams<{
        id?: string;
        locationId?: string;
    }>();

    const { user, isLoading: isAuthLoading } = useAuth();

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canEditLocation, setCanEditLocation] = useState(false);

    const locationForm = useStandlLocationForm(setErrorMessage);

    useEffect(() => {
        async function loadLocation() {
            if (isAuthLoading) {
                return;
            }

            if (!id || !locationId) {
                setErrorMessage("Es wurde keine Standort-ID übergeben.");
                setIsLoading(false);
                return;
            }

            if (!user) {
                setErrorMessage(
                    "Du musst eingeloggt sein, um einen Standort zu bearbeiten."
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

                if (!standl.isClaimed || standl.ownerId !== user.uid) {
                    setErrorMessage(
                        "Du kannst nur Standorte deiner eigenen Standl bearbeiten."
                    );
                    return;
                }

                const location = (standl.locations ?? []).find(
                    (item) => item.id === locationId
                );

                if (!location) {
                    setErrorMessage("Standort wurde nicht gefunden.");
                    return;
                }

                locationForm.handleLocationInputModeChange("address");

                locationForm.setLocationName(
                    location.locationName ?? ""
                );
                locationForm.setStreet(location.street ?? "");
                locationForm.setStreetNumber(
                    location.streetNumber ?? ""
                );
                locationForm.setPostalCode(
                    location.postalCode ?? ""
                );
                locationForm.setCity(location.city ?? "");

                locationForm.setSelectedLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

                locationForm.setMapRegion({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });

                setCanEditLocation(true);
            } catch (error) {
                console.warn(
                    "Standort konnte nicht geladen werden:",
                    error
                );
                setErrorMessage("Standort konnte nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        }

        loadLocation();
    }, [id, locationId, user, isAuthLoading]);

    function validateLocation() {
        if (locationForm.locationName.trim().length < 2) {
            setErrorMessage(
                "Bitte gib eine Standortbezeichnung ein."
            );
            return false;
        }

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

    async function handleUpdateLocation() {
        setErrorMessage("");

        if (!id || !locationId || !user || !canEditLocation) {
            setErrorMessage(
                "Der Standort kann nicht bearbeitet werden."
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
            await updateStandlLocation({
                standlId: id,
                locationId,
                locationName: locationForm.locationName.trim(),
                street: locationForm.street.trim(),
                streetNumber: locationForm.streetNumber.trim(),
                postalCode: locationForm.postalCode.trim(),
                city: locationForm.city.trim(),
                latitude: locationForm.selectedLocation.latitude,
                longitude: locationForm.selectedLocation.longitude,
            });

            router.replace(routes.standlDetail(id));
        } catch (error) {
            console.warn(
                "Standort konnte nicht aktualisiert werden:",
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
            <ScreenState message="Standort wird geladen..." />
        );
    }

    if (!canEditLocation) {
        return (
            <ScreenState
                title="Standort bearbeiten nicht möglich"
                message={
                    errorMessage ||
                    "Für diesen Standort fehlen die Berechtigungen."
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
            <Text style={styles.title}>Standort bearbeiten</Text>

            <Text style={styles.subtitle}>
                Ändere Standortbezeichnung, Adresse oder Kartenposition.
            </Text>

            <View style={styles.form}>
                <StandlLocationInput
                    locationInputMode={locationForm.locationInputMode}
                    onChangeLocationInputMode={
                        locationForm.handleLocationInputModeChange
                    }
                    locationName={locationForm.locationName}
                    onChangeLocationName={
                        locationForm.setLocationName
                    }
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
                    onPress={handleUpdateLocation}
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