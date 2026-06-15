import type { StandlSchedule } from "@/types/standlSchedule";
export type StandlLocationSource = "owner" | "community";

export type StandlLocationStatus =
    | "verified"
    | "pending"
    | "rejected";

export type StandlLocation = {
    id: string;
    standlId: string;

    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;

    latitude: number;
    longitude: number;

    schedules?: StandlSchedule[];

    source: StandlLocationSource;
    status: StandlLocationStatus;

    createdBy: string;
};

export type LocationOpeningStatusType =
    | "open"
    | "opensLater"
    | "closed"
    | "unknown";

export type LocationOpeningStatus = {
    type: LocationOpeningStatusType;
    label: string;
};