import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View, } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { StandlBasicInfoForm } from "@/components/standlForm/StandlBasicInfoForm";
import { StandlLocationInput } from "@/components/standlForm/StandlLocationInput";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useStandlLocationForm } from "@/hooks/useStandlLocationForm";
import { createStandlInFirestore } from "@/lib/standlService";
import type { StandlCategory } from "@/types/standl";
import type { AddMode } from "@/types/standlForm";
import { validateStandlForm } from "@/lib/validateStandlForm";

export default function NewStandlScreen() {
    const { user } = useAuth();
    const { mode } = useLocalSearchParams<{ mode?: string; }>();

    const addMode: AddMode = mode === "owner" ? "owner" : "community";

    const [name, setName] = useState("");
    const [category, setCategory] = useState<StandlCategory>("hendl");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locationForm = useStandlLocationForm(setErrorMessage);

    const title =
        addMode === "owner" ? "Eigenes Standl hinzufügen" : "Standl vorschlagen";

    const subtitle =
        addMode === "owner"
            ? "Dieses Standl wird direkt deinem Besitzerkonto zugeordnet."
            : "Dieses Standl wird als Community-Vorschlag gespeichert.";

    async function handleCreateStandl() {
        setErrorMessage("");

        if (!user || !locationForm.selectedLocation) {
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
            const createdStandlId = await createStandlInFirestore({
                name: name.trim(),
                category,
                locationName: locationForm.locationName.trim(),
                street: locationForm.street.trim(),
                streetNumber: locationForm.streetNumber.trim(),
                postalCode: locationForm.postalCode.trim(),
                city: locationForm.city.trim(),
                latitude: locationForm.selectedLocation.latitude,
                longitude: locationForm.selectedLocation.longitude,
                createdBy: user.uid,
                mode: addMode,
            });

            router.replace(`/standl/${createdStandlId}`);
        } catch (error) {
            console.warn("Standl konnte nicht erstellt werden:", error);
            setErrorMessage("Standl konnte nicht erstellt werden.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <FormScreen
            scrollRef={locationForm.scrollViewRef}
            contentStyle={styles.content}
        >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

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
                        isSubmitting ? "Wird gespeichert..." : "Standl speichern"
                    }
                    onPress={handleCreateStandl}
                    disabled={isSubmitting}
                />

                <SecondaryButton label="Zurück" onPress={() => router.back()} />
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