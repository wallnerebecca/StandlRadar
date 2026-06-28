import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { FormScreen } from "@/components/layout/FormScreen";
import { ScreenState } from "@/components/layout/ScreenState";
import { SchedulePreviewList } from "@/components/standlSchedule/SchedulePreviewList";
import { ScheduleTimeFields } from "@/components/standlSchedule/ScheduleTimeFields";
import { ScheduleWeekdaySelector } from "@/components/standlSchedule/ScheduleWeekdaySelector";
import { Theme } from "@/constants/colors";
import { useStandlScheduleEditor } from "@/hooks/useStandlScheduleEditor";
import { routes } from "@/lib/routes";

export default function NewStandlScheduleScreen() {
    const { id, locationId } = useLocalSearchParams<{
        id?: string;
        locationId?: string;
    }>();

    const editor = useStandlScheduleEditor({
        standlId: id,
        locationId,
    });

    const {
        isLoading,
        isSubmitting,
        canManageSchedule,
        isAuthenticated,
        errorMessage,
    } = editor.status;

    const {
        locationName,
        hadExistingSchedules,
        drafts,
        previewGroups,
    } = editor.schedule;

    const {
        selectedWeekdays,
        startTime,
        endTime,
        setStartTime,
        setEndTime,
    } = editor.form;

    async function handleSaveSchedules() {
        const saved = await editor.actions.saveSchedules();

        if (saved && id) {
            router.replace(routes.standlDetail(id));
        }
    }

    async function handleDeleteAllSchedules() {
        const deleted = await editor.actions.deleteAllSchedules();

        if (deleted && id) {
            router.replace(routes.standlDetail(id));
        }
    }

    if (isLoading) {
        return <ScreenState message="Standort wird geladen..." />;
    }

    if (!canManageSchedule) {
        return (
            <ScreenState
                title="Standzeiten verwalten nicht möglich"
                message={
                    errorMessage ||
                    "Für diesen Standort fehlen die Berechtigungen."
                }
                primaryActionLabel={
                    !isAuthenticated ? "Einloggen" : undefined
                }
                onPrimaryAction={
                    !isAuthenticated
                        ? () => router.push(routes.login)
                        : undefined
                }
                secondaryActionLabel="Zurück"
                onSecondaryAction={() => router.back()}
            />
        );
    }

    return (
        <FormScreen contentStyle={styles.content}>
            <Text style={styles.title}>
                {hadExistingSchedules
                    ? "Standzeiten bearbeiten"
                    : "Standzeiten hinzufügen"}
            </Text>

            <Text style={styles.subtitle}>
                Lege fest, wann dein Standl am Standort „{locationName}“
                geöffnet ist.
            </Text>

            <View style={styles.form}>
                <ScheduleWeekdaySelector
                    selectedWeekdays={selectedWeekdays}
                    onToggleWeekday={editor.actions.toggleWeekday}
                    onToggleAll={editor.actions.toggleAllWeekdays}
                />

                <ScheduleTimeFields
                    startTime={startTime}
                    endTime={endTime}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                />

                <SecondaryButton
                    label="Zur Vorschau hinzufügen"
                    onPress={editor.actions.addToPreview}
                />

                <SchedulePreviewList
                    groups={previewGroups}
                    onRemove={editor.actions.removeDraft}
                />

                {errorMessage ? (
                    <Text style={styles.errorText}>
                        {errorMessage}
                    </Text>
                ) : null}

                <PrimaryButton
                    label={
                        isSubmitting
                            ? "Standzeiten werden gespeichert..."
                            : hadExistingSchedules
                                ? "Standzeiten aktualisieren"
                                : "Standzeiten speichern"
                    }
                    onPress={handleSaveSchedules}
                    disabled={isSubmitting || drafts.length === 0}
                />

                {hadExistingSchedules ? (
                    <SecondaryButton
                        label="Alle Standzeiten löschen"
                        onPress={handleDeleteAllSchedules}
                        disabled={isSubmitting}
                    />
                ) : null}

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
        gap: 16,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});
