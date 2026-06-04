import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { StandlBasicInfoForm } from "@/components/standlForm/StandlBasicInfoForm";
import { StandlLocationInput } from "@/components/standlForm/StandlLocationInput";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useStandlLocationForm } from "@/hooks/useStandlLocationForm";
import { createStandlInFirestore } from "@/lib/standlService";
import type { StandlCategory } from "@/types/standl";
import type { AddMode } from "@/types/standlForm";

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

    function getLocationNameValue() {
        return locationForm.locationName.trim();
    }

    function validateForm() {
        if (!user) {
            router.push("/auth/login");
            return false;
        }

        if (name.trim().length < 2) {
            setErrorMessage("Bitte gib einen Namen ein.");
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

    async function handleCreateStandl() {
        setErrorMessage("");

        if (!validateForm()) {
            return;
        }

        if (!user || !locationForm.selectedLocation) {
            return;
        }

        setIsSubmitting(true);

        try {
            const createdStandlId = await createStandlInFirestore({
                name: name.trim(),
                category,
                locationName: getLocationNameValue(),
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
        <SafeAreaView style={styles.screen} edges={["top"]}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
            >
                <ScrollView
                    ref={locationForm.scrollViewRef}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
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
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 32,
        paddingBottom: 160,
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