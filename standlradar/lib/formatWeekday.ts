import type { Weekday } from "@/types/standlSchedule";

const WEEKDAY_LABELS: Record<Weekday, string> = {
    1: "Montag",
    2: "Dienstag",
    3: "Mittwoch",
    4: "Donnerstag",
    5: "Freitag",
    6: "Samstag",
    7: "Sonntag",
};

export function formatWeekday(weekday: Weekday) {
    return WEEKDAY_LABELS[weekday];
}