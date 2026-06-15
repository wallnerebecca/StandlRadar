export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StandlScheduleSource = "owner" | "community";

export type StandlScheduleStatus =
    | "verified"
    | "pending"
    | "rejected";

export type StandlSchedule = {
    id: string;
    standlId: string;
    locationId: string;

    weekday: Weekday;
    startTime: string;
    endTime: string;

    source: StandlScheduleSource;
    status: StandlScheduleStatus;

    createdBy: string;
};