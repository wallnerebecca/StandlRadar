import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View, } from "react-native";

import { FormScreen } from "@/components/layout/FormScreen";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { StandlFormFields } from "@/components/standlForm/StandlFormFields";
import { AppHeader } from "@/components/AppHeader";

import { useAuth } from "@/contexts/AuthContext";

import { useStandlForm } from "@/hooks/useStandlForm";

import { createStandlInFirestore } from "@/lib/standlService";
import { routes } from "@/lib/routes";

import type { AddMode } from "@/types/standlForm";


export default function NewStandlScreen() {
    const { user } = useAuth();
    const { mode } = useLocalSearchParams<{ mode?: string; }>();

    const addMode: AddMode = mode === "owner" ? "owner" : "community";

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
    } = useStandlForm();

    const title =
        addMode === "owner" ? "Eigenes Standl hinzufügen" : "Standl vorschlagen";

    const subtitle =
        addMode === "owner"
            ? "Dieses Standl wird direkt deinem Besitzerkonto zugeordnet."
            : "Dieses Standl wird als Community-Vorschlag gespeichert.";

    async function handleCreateStandl() {
        setErrorMessage("");

        if (!user) {
            router.push(routes.login);
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
            const createdStandlId = await createStandlInFirestore({
                ...editableFields,
                createdBy: user.uid,
                mode: addMode,
            });

            if (addMode === "owner") {
                router.replace(routes.owner);
                return;
            }

            router.replace(routes.standlDetail(createdStandlId));
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
            <AppHeader
                title={title}
                subtitle={subtitle}
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
                        isSubmitting ? "Wird gespeichert..." : "Standl speichern"
                    }
                    onPress={handleCreateStandl}
                    disabled={isSubmitting}
                />
                {addMode === "owner" ? (
                    <SecondaryButton
                        label="Meine Standl"
                        onPress={() => router.replace(routes.owner)}
                    />
                ) : null}
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