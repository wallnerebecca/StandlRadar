import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { FormScreen } from "@/components/layout/FormScreen";
import { ScreenState } from "@/components/layout/ScreenState";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/lib/routes";
import { replaceStandlLocationSchedules } from "@/lib/standlScheduleService";
import { getSingleStandlFromFirestore } from "@/lib/standlService";
import type { Weekday } from "@/types/standlSchedule";

const WEEKDAYS: {
    value: Weekday;
    label: string;
    shortLabel: string;
}[] = [
        { value: 1, label: "Montag", shortLabel: "Mo" },
        { value: 2, label: "Dienstag", shortLabel: "Di" },
        { value: 3, label: "Mittwoch", shortLabel: "Mi" },
        { value: 4, label: "Donnerstag", shortLabel: "Do" },
        { value: 5, label: "Freitag", shortLabel: "Fr" },
        { value: 6, label: "Samstag", shortLabel: "Sa" },
        { value: 7, label: "Sonntag", shortLabel: "So" },
    ];

type ScheduleDraft = {
    weekday: Weekday;
    startTime: string;
    endTime: string;
};

type SchedulePreviewGroup = {
    id: string;
    weekdays: Weekday[];
    startTime: string;
    endTime: string;
};

export default function NewStandlScheduleScreen() {
    const { id, locationId } = useLocalSearchParams<{
        id?: string;
        locationId?: string;
    }>();

    const { user, isLoading: isAuthLoading } = useAuth();

    const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [locationName, setLocationName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canManageSchedule, setCanManageSchedule] = useState(false);

    const [scheduleDrafts, setScheduleDrafts] = useState<ScheduleDraft[]>([]);
    const [hadExistingSchedules, setHadExistingSchedules] = useState(false);

    const schedulePreviewGroups = useMemo(() => {
        const groupedSchedules = new Map<
            string,
            SchedulePreviewGroup
        >();

        scheduleDrafts.forEach((schedule) => {
            const key = `${schedule.startTime}-${schedule.endTime}`;
            const existingGroup = groupedSchedules.get(key);

            if (existingGroup) {
                existingGroup.weekdays.push(schedule.weekday);
                return;
            }

            groupedSchedules.set(key, {
                id: key,
                weekdays: [schedule.weekday],
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            });
        });

        return Array.from(groupedSchedules.values())
            .map((group) => ({
                ...group,
                weekdays: [...group.weekdays].sort(
                    (firstDay, secondDay) =>
                        firstDay - secondDay
                ),
            }))
            .sort(
                (firstGroup, secondGroup) =>
                    firstGroup.weekdays[0] -
                    secondGroup.weekdays[0]
            );
    }, [scheduleDrafts]);

    useEffect(() => {
        async function checkPermission() {
            if (isAuthLoading) {
                return;
            }

            if (!id || !locationId) {
                setErrorMessage(
                    "Standl oder Standort konnte nicht bestimmt werden."
                );
                setIsLoading(false);
                return;
            }

            if (!user) {
                setErrorMessage(
                    "Du musst eingeloggt sein, um Standzeiten zu verwalten."
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
                        "Du kannst nur Standzeiten deiner eigenen Standl verwalten."
                    );
                    return;
                }

                const location = standl.locations?.find(
                    (item) => item.id === locationId
                );

                if (!location) {
                    setErrorMessage("Standort wurde nicht gefunden.");
                    return;
                }

                const existingSchedules = (location.schedules ?? []).filter(
                    (schedule) => schedule.status === "verified");

                setHadExistingSchedules(
                    existingSchedules.length > 0
                );

                setScheduleDrafts(
                    existingSchedules
                        .map((schedule) => ({
                            weekday: schedule.weekday,
                            startTime: schedule.startTime,
                            endTime: schedule.endTime,
                        }))
                        .sort(
                            (firstSchedule, secondSchedule) =>
                                firstSchedule.weekday -
                                secondSchedule.weekday
                        )
                );

                setLocationName(
                    location.locationName ||
                    location.city ||
                    "Ausgewählter Standort"
                );

                setCanManageSchedule(true);
            } catch (error) {
                console.warn(
                    "Standl oder Standort konnte nicht geprüft werden:",
                    error
                );

                setErrorMessage(
                    "Standl oder Standort konnte nicht geladen werden."
                );
            } finally {
                setIsLoading(false);
            }
        }

        checkPermission();
    }, [id, locationId, user, isAuthLoading]);

    function isValidTime(value: string) {
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    }

    function timeToMinutes(value: string) {
        const [hours, minutes] = value
            .split(":")
            .map(Number);

        return hours * 60 + minutes;
    }

    function toggleWeekday(day: Weekday) {
        setSelectedWeekdays((currentDays) =>
            currentDays.includes(day)
                ? currentDays.filter(
                    (currentDay) => currentDay !== day
                )
                : [...currentDays, day]
        );
    }

    function toggleAllWeekdays() {
        setSelectedWeekdays((currentDays) =>
            currentDays.length === WEEKDAYS.length
                ? []
                : WEEKDAYS.map((day) => day.value)
        );
    }

    function validateSchedule() {
        const trimmedStartTime = startTime.trim();
        const trimmedEndTime = endTime.trim();

        if (selectedWeekdays.length === 0) {
            setErrorMessage(
                "Bitte wähle mindestens einen Wochentag aus."
            );
            return false;
        }

        if (!isValidTime(trimmedStartTime)) {
            setErrorMessage(
                "Bitte gib die Startzeit im Format HH:MM ein."
            );
            return false;
        }

        if (!isValidTime(trimmedEndTime)) {
            setErrorMessage(
                "Bitte gib die Endzeit im Format HH:MM ein."
            );
            return false;
        }

        if (
            timeToMinutes(trimmedEndTime) <=
            timeToMinutes(trimmedStartTime)
        ) {
            setErrorMessage(
                "Die Endzeit muss nach der Startzeit liegen."
            );
            return false;
        }

        return true;
    }

    function handleAddToPreview() {
        setErrorMessage("");

        if (!validateSchedule()) {
            return;
        }

        const sortedWeekdays = [...selectedWeekdays].sort(
            (firstDay, secondDay) => firstDay - secondDay
        );

        const trimmedStartTime = startTime.trim();
        const trimmedEndTime = endTime.trim();

        setScheduleDrafts((currentDrafts) => {
            const draftsWithoutSelectedDays =
                currentDrafts.filter(
                    (draft) =>
                        !sortedWeekdays.includes(draft.weekday)
                );

            const updatedDrafts = sortedWeekdays.map(
                (day) => ({
                    weekday: day,
                    startTime: trimmedStartTime,
                    endTime: trimmedEndTime,
                })
            );

            return [
                ...draftsWithoutSelectedDays,
                ...updatedDrafts,
            ].sort(
                (firstDraft, secondDraft) =>
                    firstDraft.weekday -
                    secondDraft.weekday
            );
        });

        setSelectedWeekdays([]);
        setStartTime("");
        setEndTime("");
    }

    function removeScheduleDraft(
        weekdaysToRemove: Weekday[]
    ) {
        setScheduleDrafts((currentDrafts) =>
            currentDrafts.filter(
                (draft) =>
                    !weekdaysToRemove.includes(
                        draft.weekday
                    )
            )
        );
    }

    async function handleSaveSchedules() {
        setErrorMessage("");

        if (
            !id ||
            !locationId ||
            !user ||
            !canManageSchedule
        ) {
            setErrorMessage(
                "Die Standzeiten können nicht gespeichert werden."
            );
            return;
        }

        if (scheduleDrafts.length === 0) {
            setErrorMessage(
                "Füge zuerst mindestens eine Standzeit zur Vorschau hinzu."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const schedulesToCreate =
                scheduleDrafts.map((draft) => ({
                    weekday: draft.weekday,
                    startTime: draft.startTime,
                    endTime: draft.endTime,
                }));

            await replaceStandlLocationSchedules({
                standlId: id,
                locationId,
                schedules: schedulesToCreate,
                source: "owner",
                status: "verified",
                createdBy: user.uid,
            });

            router.replace(routes.standlDetail(id));
        } catch (error) {
            console.warn(
                "Standzeiten konnten nicht gespeichert werden:",
                error
            );

            setErrorMessage(
                "Standzeiten konnten nicht gespeichert werden."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDeleteAllSchedules() {
        setErrorMessage("");

        if (
            !id ||
            !locationId ||
            !user ||
            !canManageSchedule
        ) {
            setErrorMessage(
                "Die Standzeiten können nicht gelöscht werden."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await replaceStandlLocationSchedules({
                standlId: id,
                locationId,
                schedules: [],
                source: "owner",
                status: "verified",
                createdBy: user.uid,
            });

            router.replace(routes.standlDetail(id));
        } catch (error) {
            console.warn(
                "Standzeiten konnten nicht gelöscht werden:",
                error
            );

            setErrorMessage(
                "Standzeiten konnten nicht gelöscht werden."
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

    if (!canManageSchedule) {
        return (
            <ScreenState
                title="Standzeiten verwalten nicht möglich"
                message={
                    errorMessage ||
                    "Für diesen Standort fehlen die Berechtigungen."
                }
                primaryActionLabel={
                    !user ? "Einloggen" : undefined
                }
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
        <FormScreen contentStyle={styles.content}>
            <Text style={styles.title}>
                {hadExistingSchedules
                    ? "Standzeiten bearbeiten"
                    : "Standzeiten hinzufügen"}
            </Text>

            <Text style={styles.subtitle}>
                Lege fest, wann dein Standl am Standort „
                {locationName}“ geöffnet ist.
            </Text>

            <View style={styles.form}>
                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                        Wochentage
                    </Text>

                    <View style={styles.weekdayRow}>
                        {WEEKDAYS.map((day) => {
                            const isSelected =
                                selectedWeekdays.includes(
                                    day.value
                                );

                            return (
                                <Pressable
                                    key={day.value}
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        day.label
                                    }
                                    accessibilityState={{
                                        selected: isSelected,
                                    }}
                                    onPress={() =>
                                        toggleWeekday(day.value)
                                    }
                                    style={({ pressed }) => [
                                        styles.weekdayButton,
                                        isSelected &&
                                        styles.weekdayButtonSelected,
                                        pressed &&
                                        styles.weekdayButtonPressed,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.weekdayButtonText,
                                            isSelected &&
                                            styles.weekdayButtonTextSelected,
                                        ]}
                                    >
                                        {day.shortLabel}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <SecondaryButton
                        label={
                            selectedWeekdays.length ===
                                WEEKDAYS.length
                                ? "Alle Tage abwählen"
                                : "Alle Tage auswählen"
                        }
                        onPress={toggleAllWeekdays}
                    />
                </View>

                <View style={styles.timeRow}>
                    <View style={styles.timeField}>
                        <Text style={styles.label}>
                            Von
                        </Text>

                        <TextInput
                            value={startTime}
                            onChangeText={setStartTime}
                            placeholder="08:00"
                            placeholderTextColor={
                                Theme.textSecondary
                            }
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.timeField}>
                        <Text style={styles.label}>
                            Bis
                        </Text>

                        <TextInput
                            value={endTime}
                            onChangeText={setEndTime}
                            placeholder="14:00"
                            placeholderTextColor={
                                Theme.textSecondary
                            }
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            style={styles.input}
                        />
                    </View>
                </View>

                <Text style={styles.hint}>
                    Verwende das 24-Stunden-Format, zum
                    Beispiel 08:30 bis 14:00.
                </Text>

                <SecondaryButton
                    label="Zur Vorschau hinzufügen"
                    onPress={handleAddToPreview}
                />

                <View style={styles.previewSection}>
                    <Text style={styles.previewTitle}>
                        Vorschau
                    </Text>

                    {schedulePreviewGroups.length > 0 ? (
                        <View style={styles.previewList}>
                            {schedulePreviewGroups.map(
                                (draft) => (
                                    <View
                                        key={draft.id}
                                        style={
                                            styles.previewCard
                                        }
                                    >
                                        <View
                                            style={
                                                styles.previewText
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.previewDays
                                                }
                                            >
                                                {draft.weekdays
                                                    .map(
                                                        (day) =>
                                                            WEEKDAYS.find(
                                                                (
                                                                    weekday
                                                                ) =>
                                                                    weekday.value ===
                                                                    day
                                                            )
                                                                ?.shortLabel
                                                    )
                                                    .filter(
                                                        Boolean
                                                    )
                                                    .join(", ")}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.previewTime
                                                }
                                            >
                                                {
                                                    draft.startTime
                                                }
                                                –
                                                {draft.endTime}
                                            </Text>
                                        </View>

                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Standzeit aus Vorschau entfernen"
                                            onPress={() =>
                                                removeScheduleDraft(
                                                    draft.weekdays
                                                )
                                            }
                                            style={({
                                                pressed,
                                            }) => [
                                                    styles.removeButton,
                                                    pressed &&
                                                    styles.removeButtonPressed,
                                                ]}
                                        >
                                            <Text
                                                style={
                                                    styles.removeButtonText
                                                }
                                            >
                                                Entfernen
                                            </Text>
                                        </Pressable>
                                    </View>
                                )
                            )}
                        </View>
                    ) : (
                        <Text
                            style={
                                styles.emptyPreviewText
                            }
                        >
                            Noch keine Standzeiten zur
                            Vorschau hinzugefügt.
                        </Text>
                    )}
                </View>

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
                    disabled={
                        isSubmitting ||
                        scheduleDrafts.length === 0
                    }
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
    fieldGroup: {
        gap: 10,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    weekdayRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    weekdayButton: {
        minWidth: 42,
        minHeight: 42,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.border,
        backgroundColor: Theme.card,
        alignItems: "center",
        justifyContent: "center",
    },
    weekdayButtonSelected: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    weekdayButtonPressed: {
        opacity: 0.8,
    },
    weekdayButtonText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "700",
    },
    weekdayButtonTextSelected: {
        color: Theme.textPrimary,
    },
    timeRow: {
        flexDirection: "row",
        gap: 12,
    },
    timeField: {
        flex: 1,
        gap: 8,
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
    hint: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
    previewSection: {
        gap: 10,
    },
    previewTitle: {
        color: Theme.textPrimary,
        fontSize: 17,
        fontWeight: "800",
    },
    previewList: {
        gap: 10,
    },
    previewCard: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    previewText: {
        flex: 1,
        gap: 3,
    },
    previewDays: {
        color: Theme.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    previewTime: {
        color: Theme.textSecondary,
        fontSize: 14,
    },
    removeButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    removeButtonPressed: {
        opacity: 0.7,
    },
    removeButtonText: {
        color: Theme.error,
        fontSize: 13,
        fontWeight: "700",
    },
    emptyPreviewText: {
        color: Theme.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});