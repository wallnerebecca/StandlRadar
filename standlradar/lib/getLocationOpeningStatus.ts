import type {
    LocationOpeningStatus,
    StandlLocation,
} from "@/types/standlLocation";
import type { Weekday } from "@/types/standlSchedule";

function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}

function getCurrentWeekday(date: Date): Weekday {
    const javascriptDay = date.getDay();

    return (javascriptDay === 0 ? 7 : javascriptDay) as Weekday;
}

export function getLocationOpeningStatus(
    location: StandlLocation,
    currentDate = new Date()
): LocationOpeningStatus {
    const schedules = location.schedules ?? [];

    if (schedules.length === 0) {
        return {
            type: "unknown",
            label: "Keine Standzeit bekannt",
        };
    }

    const currentWeekday = getCurrentWeekday(currentDate);

    const currentMinutes =
        currentDate.getHours() * 60 +
        currentDate.getMinutes();

    const todaysSchedules = schedules
        .filter(
            (schedule) =>
                schedule.weekday === currentWeekday &&
                schedule.status === "verified"
        )
        .sort((firstSchedule, secondSchedule) =>
            firstSchedule.startTime.localeCompare(
                secondSchedule.startTime
            )
        );

    if (todaysSchedules.length === 0) {
        return {
            type: "closed",
            label: "Heute nicht geöffnet",
        };
    }

    const activeSchedule = todaysSchedules.find((schedule) => {
        const startMinutes = timeToMinutes(schedule.startTime);
        const endMinutes = timeToMinutes(schedule.endTime);

        return (
            currentMinutes >= startMinutes &&
            currentMinutes < endMinutes
        );
    });

    if (activeSchedule) {
        return {
            type: "open",
            label: `Jetzt geöffnet · bis ${activeSchedule.endTime}`,
        };
    }

    const nextSchedule = todaysSchedules.find(
        (schedule) =>
            timeToMinutes(schedule.startTime) > currentMinutes
    );

    if (nextSchedule) {
        return {
            type: "opensLater",
            label: `Öffnet heute um ${nextSchedule.startTime}`,
        };
    }

    return {
        type: "closed",
        label: "Heute bereits geschlossen",
    };
}