import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { FormScreen } from "@/components/layout/FormScreen";
import { ScreenState } from "@/components/layout/ScreenState";
import { OwnerStandlLocationsSection } from "@/components/owner/OwnerStandlLocationsSection";
import { StandlBasicInfoForm } from "@/components/standlForm/StandlBasicInfoForm";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useEditStandl } from "@/hooks/useEditStandl";
import { routes } from "@/lib/routes";

export default function EditStandlScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { user, isLoading: isAuthLoading } = useAuth();

    const {
        standl,
        name,
        setName,
        category,
        setCategory,
        errorMessage,
        isLoading,
        isSubmitting,
        canEdit,
        updateStandl,
    } = useEditStandl({
        id,
        userId: user?.uid,
        isAuthLoading,
    });

    async function handleUpdateStandl() {
        const wasUpdated = await updateStandl();

        if (wasUpdated && id) {
            router.replace(routes.standlDetail(id));
        }
    }

    if (isLoading || isAuthLoading) {
        return <ScreenState message="Standl wird geladen..." />;
    }

    if (!canEdit || !standl) {
        return (
            <ScreenState
                title="Bearbeiten nicht möglich"
                message={
                    errorMessage ||
                    "Für dieses Standl fehlen die Berechtigungen."
                }
                primaryActionLabel={!user ? "Einloggen" : undefined}
                onPrimaryAction={
                    !user ? () => router.push(routes.login) : undefined
                }
                secondaryActionLabel="Zurück"
                onSecondaryAction={() => router.back()}
            />
        );
    }

    return (
        <FormScreen contentStyle={styles.content}>
            <AppHeader
                title="Standl bearbeiten"
                subtitle="Verwalte Standl-Standorte."
            />

            <View style={styles.form}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Allgemeine Informationen
                    </Text>

                    <StandlBasicInfoForm
                        name={name}
                        onChangeName={setName}
                        category={category}
                        onChangeCategory={setCategory}
                    />
                </View>

                <OwnerStandlLocationsSection standl={standl} />

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
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});
