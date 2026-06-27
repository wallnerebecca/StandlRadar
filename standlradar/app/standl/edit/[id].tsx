import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { ScreenState } from "@/components/layout/ScreenState";
import { FormScreen } from "@/components/layout/FormScreen";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { StandlFormFields } from "@/components/standlForm/StandlFormFields";

import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

import {
    getSingleStandlFromFirestore,
    updateOwnerStandlInFirestore,
} from "@/lib/standlService";
import { routes } from "@/lib/routes";


import { useStandlForm } from "@/hooks/useStandlForm";

export default function EditStandlScreen() {
    const { id } = useLocalSearchParams<{ id?: string; }>();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [canEdit, setCanEdit] = useState(false);

    const {
        name,
        setName,
        category,
        setCategory,
        errorMessage,
        setErrorMessage,
        isSubmitting,
        setIsSubmitting,
        locationForm,
        validate,
        getEditableFields,
        fillFromStandl,
    } = useStandlForm();


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

                fillFromStandl(standl);
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

        if (!validate()) {
            return;
        }

        const editableFields = getEditableFields();

        if (!editableFields) {
            return;
        }

        setIsSubmitting(true);

        try {
            await updateOwnerStandlInFirestore(id, user.uid, editableFields);

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
            scrollRef={locationForm.scrollViewRef}
            contentStyle={styles.content}
        >
            <AppHeader
                title="Standl bearbeiten"
                subtitle="Aktualisiere Name, Kategorie und Standortdaten."
            />

            <View style={styles.form}>
                <StandlFormFields
                    name={name}
                    onChangeName={setName}
                    category={category}
                    onChangeCategory={setCategory}
                    locationForm={locationForm}
                    errorMessage={errorMessage}
                />

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
});