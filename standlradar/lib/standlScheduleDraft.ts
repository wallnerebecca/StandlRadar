import type { Weekday } from "@/types/standlSchedule";

export const WEEKDAYS: {
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

export type ScheduleDraft = {
    weekday: Weekday;
    startTime: string;
    endTime: string;
};

export type SchedulePreviewGroup = {
    id: string;
    weekdays: Weekday[];
    startTime: string;
    endTime: string;
};

function isValidTime(value: string) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeToMinutes(value: string) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

export function validateScheduleInput(
    selectedWeekdays: Weekday[],
    startTime: string,
    endTime: string
) {
    const trimmedStartTime = startTime.trim();
    const trimmedEndTime = endTime.trim();

    if (selectedWeekdays.length === 0) {
        return "Bitte wähle mindestens einen Wochentag aus.";
    }

    if (!isValidTime(trimmedStartTime)) {
        return "Bitte gib eine gültige Startzeit ein.";
    }

    if (!isValidTime(trimmedEndTime)) {
        return "Bitte gib eine gültige Endzeit ein.";
    }

    if (timeToMinutes(trimmedEndTime) <= timeToMinutes(trimmedStartTime)) {
        return "Die Endzeit muss nach der Startzeit liegen.";
    }

    return null;
}

export function addScheduleDrafts(
    currentDrafts: ScheduleDraft[],
    selectedWeekdays: Weekday[],
    startTime: string,
    endTime: string
) {
    const sortedWeekdays = [...selectedWeekdays].sort(
        (firstDay, secondDay) => firstDay - secondDay
    );

    const draftsWithoutSelectedDays = currentDrafts.filter(
        (draft) => !sortedWeekdays.includes(draft.weekday)
    );

    const updatedDrafts = sortedWeekdays.map((weekday) => ({
        weekday,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
    }));

    return [...draftsWithoutSelectedDays, ...updatedDrafts].sort(
        (firstDraft, secondDraft) =>
            firstDraft.weekday - secondDraft.weekday
    );
}

export function removeScheduleDrafts(
    currentDrafts: ScheduleDraft[],
    weekdaysToRemove: Weekday[]
) {
    return currentDrafts.filter(
        (draft) => !weekdaysToRemove.includes(draft.weekday)
    );
}

export function groupScheduleDrafts(
    scheduleDrafts: ScheduleDraft[]
): SchedulePreviewGroup[] {
    const groupedSchedules = new Map<string, SchedulePreviewGroup>();

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
                (firstDay, secondDay) => firstDay - secondDay
            ),
        }))
        .sort(
            (firstGroup, secondGroup) =>
                firstGroup.weekdays[0] - secondGroup.weekdays[0]
        );
}
