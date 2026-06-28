import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
    WEEKDAYS,
    addScheduleDrafts,
    groupScheduleDrafts,
    removeScheduleDrafts,
    validateScheduleInput,
    type ScheduleDraft,
} from "@/lib/standlScheduleDraft";
import { replaceStandlLocationSchedules } from "@/lib/standlScheduleService";
import { getSingleStandlFromFirestore } from "@/lib/standlService";
import type { Weekday } from "@/types/standlSchedule";

type UseStandlScheduleEditorParams = {
    standlId?: string;
    locationId?: string;
};

export function useStandlScheduleEditor({
    standlId,
    locationId,
}: UseStandlScheduleEditorParams) {
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

    const schedulePreviewGroups = useMemo(
        () => groupScheduleDrafts(scheduleDrafts),
        [scheduleDrafts]
    );

    useEffect(() => {
        let isActive = true;

        async function loadScheduleEditor() {
            if (isAuthLoading) {
                return;
            }

            setIsLoading(true);
            setCanManageSchedule(false);
            setErrorMessage("");

            if (!standlId || !locationId) {
                if (isActive) {
                    setErrorMessage(
                        "Standl oder Standort konnte nicht bestimmt werden."
                    );
                    setIsLoading(false);
                }
                return;
            }

            if (!user) {
                if (isActive) {
                    setErrorMessage(
                        "Du musst eingeloggt sein, um Standzeiten zu verwalten."
                    );
                    setIsLoading(false);
                }
                return;
            }

            try {
                const standl = await getSingleStandlFromFirestore(standlId);

                if (!isActive) {
                    return;
                }

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
                    (schedule) => schedule.status === "verified"
                );

                setHadExistingSchedules(existingSchedules.length > 0);
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
                if (!isActive) {
                    return;
                }

                console.warn(
                    "Standl oder Standort konnte nicht geprüft werden:",
                    error
                );
                setErrorMessage(
                    "Standl oder Standort konnte nicht geladen werden."
                );
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        void loadScheduleEditor();

        return () => {
            isActive = false;
        };
    }, [standlId, locationId, user, isAuthLoading]);

    function toggleWeekday(day: Weekday) {
        setSelectedWeekdays((currentDays) =>
            currentDays.includes(day)
                ? currentDays.filter((currentDay) => currentDay !== day)
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

    function addToPreview() {
        setErrorMessage("");

        const validationError = validateScheduleInput(
            selectedWeekdays,
            startTime,
            endTime
        );

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setScheduleDrafts((currentDrafts) =>
            addScheduleDrafts(
                currentDrafts,
                selectedWeekdays,
                startTime,
                endTime
            )
        );
        setSelectedWeekdays([]);
        setStartTime("");
        setEndTime("");
    }

    function removeDraft(weekdaysToRemove: Weekday[]) {
        setScheduleDrafts((currentDrafts) =>
            removeScheduleDrafts(currentDrafts, weekdaysToRemove)
        );
    }

    async function saveSchedules() {
        setErrorMessage("");

        if (
            !standlId ||
            !locationId ||
            !user ||
            !canManageSchedule
        ) {
            setErrorMessage(
                "Die Standzeiten können nicht gespeichert werden."
            );
            return false;
        }

        if (scheduleDrafts.length === 0) {
            setErrorMessage(
                "Füge zuerst mindestens eine Standzeit zur Vorschau hinzu."
            );
            return false;
        }

        setIsSubmitting(true);

        try {
            await replaceStandlLocationSchedules({
                standlId,
                locationId,
                schedules: scheduleDrafts.map((draft) => ({
                    weekday: draft.weekday,
                    startTime: draft.startTime,
                    endTime: draft.endTime,
                })),
                source: "owner",
                status: "verified",
                createdBy: user.uid,
            });

            return true;
        } catch (error) {
            console.warn(
                "Standzeiten konnten nicht gespeichert werden:",
                error
            );
            setErrorMessage(
                "Standzeiten konnten nicht gespeichert werden."
            );
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function deleteAllSchedules() {
        setErrorMessage("");

        if (
            !standlId ||
            !locationId ||
            !user ||
            !canManageSchedule
        ) {
            setErrorMessage(
                "Die Standzeiten können nicht gelöscht werden."
            );
            return false;
        }

        setIsSubmitting(true);

        try {
            await replaceStandlLocationSchedules({
                standlId,
                locationId,
                schedules: [],
                source: "owner",
                status: "verified",
                createdBy: user.uid,
            });

            return true;
        } catch (error) {
            console.warn(
                "Standzeiten konnten nicht gelöscht werden:",
                error
            );
            setErrorMessage(
                "Standzeiten konnten nicht gelöscht werden."
            );
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        status: {
            isLoading: isLoading || isAuthLoading,
            isSubmitting,
            canManageSchedule,
            isAuthenticated: !!user,
            errorMessage,
        },
        schedule: {
            locationName,
            hadExistingSchedules,
            drafts: scheduleDrafts,
            previewGroups: schedulePreviewGroups,
        },
        form: {
            selectedWeekdays,
            startTime,
            endTime,
            setStartTime,
            setEndTime,
        },
        actions: {
            toggleWeekday,
            toggleAllWeekdays,
            addToPreview,
            removeDraft,
            saveSchedules,
            deleteAllSchedules,
        },
    };
}
