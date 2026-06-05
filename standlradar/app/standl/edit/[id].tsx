import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { StandlBasicInfoForm } from "@/components/standlForm/StandlBasicInfoForm";
import { StandlLocationInput } from "@/components/standlForm/StandlLocationInput";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useStandlLocationForm } from "@/hooks/useStandlLocationForm";
import {
    getSingleStandlFromFirestore,
    updateOwnerStandlInFirestore,
} from "@/lib/standlService";
import { validateStandlForm } from "@/lib/validateStandlForm";
import type { StandlCategory } from "@/types/standl";

export default function EditStandlScreen() {
    const { id } = useLocalSearchParams<{ id?: string; }>();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [name, setName] = useState("");
    const [category, setCategory] = useState<StandlCategory>("hendl");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    const locationForm = useStandlLocationForm(setErrorMessage);

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

                setName(standl.name);
                setCategory(standl.category);

                locationForm.setLocationName(standl.locationName);
                locationForm.setStreet(standl.street ?? "");
                locationForm.setStreetNumber(standl.streetNumber ?? "");
                locationForm.setPostalCode(standl.postalCode);
                locationForm.setCity(standl.city);

                locationForm.setSelectedLocation({
                    latitude: standl.latitude,
                    longitude: standl.longitude,
                });

                locationForm.setMapRegion({
                    latitude: standl.latitude,
                    longitude: standl.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                });
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

        const validationError = validateStandlForm({
            name,
            category,
            locationInputMode: locationForm.locationInputMode,
            locationName: locationForm.locationName,
            street: locationForm.street,
            streetNumber: locationForm.streetNumber,
            postalCode: locationForm.postalCode,
            city: locationForm.city,
            selectedLocation: locationForm.selectedLocation,
        });

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        if (!locationForm.selectedLocation) {
            return;
        }

        setIsSubmitting(true);

        try {
            await updateOwnerStandlInFirestore(id, user.uid, {
                name: name.trim(),
                category,
                locationName: locationForm.locationName.trim(),
                street: locationForm.street.trim(),
                streetNumber: locationForm.streetNumber.trim(),
                postalCode: locationForm.postalCode.trim(),
                city: locationForm.city.trim(),
                latitude: locationForm.selectedLocation.latitude,
                longitude: locationForm.selectedLocation.longitude,
            });

            router.replace(`/standl/${id}`);
        } catch (error) {
            console.warn("Standl konnte nicht aktualisiert werden:", error);
            setErrorMessage("Standl konnte nicht aktualisiert werden.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading || isAuthLoading) {
        return (
            <View style={styles.centeredScreen}>
                <Text style={styles.infoText}>Standl wird geladen...</Text>
            </View>
        );
    }

    if (!canEdit) {
        return (
            <View style={styles.centeredScreen}>
                <Text style={styles.errorTitle}>Bearbeiten nicht möglich</Text>

                <Text style={styles.infoText}>
                    {errorMessage || "Für dieses Standl fehlen die Berechtigungen."}
                </Text>

                {!user ? (
                    <PrimaryButton
                        label="Einloggen"
                        onPress={() => router.push("/auth/login")}
                    />
                ) : null}

                <SecondaryButton
                    label="Zurück"
                    onPress={() => router.back()}
                />
            </View>
        );
    }

    return (
        <FormScreen
            scrollRef={locationForm.scrollViewRef}
            contentStyle={styles.content}
        >
            <Text style={styles.title}>Standl bearbeiten</Text>

            <Text style={styles.subtitle}>
                Aktualisiere Name, Kategorie und Standortdaten.
            </Text>

            <View style={styles.form}>
                <StandlBasicInfoForm
                    name={name}
                    onChangeName={setName}
                    category={category}
                    onChangeCategory={setCategory}
                />

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
                    onChangeStreetNumber={locationForm.setStreetNumber}
                    postalCode={locationForm.postalCode}
                    onChangePostalCode={locationForm.setPostalCode}
                    city={locationForm.city}
                    onChangeCity={locationForm.setCity}
                    selectedLocation={locationForm.selectedLocation}
                    mapRegion={locationForm.mapRegion}
                    onChangeMapRegion={locationForm.setMapRegion}
                    onMapPress={locationForm.handleMapPress}
                    isSearchingAddress={locationForm.isSearchingAddress}
                    onSearchAddress={locationForm.handleSearchAddress}
                />

                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
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
    centeredScreen: {
        flex: 1,
        backgroundColor: Theme.background,
        padding: 24,
        justifyContent: "center",
        gap: 16,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 30,
        fontWeight: "800",
        marginBottom: 8,
    },
    errorTitle: {
        color: Theme.textPrimary,
        fontSize: 26,
        fontWeight: "800",
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
    infoText: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});