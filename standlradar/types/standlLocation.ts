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

    source: StandlLocationSource;
    status: StandlLocationStatus;

    createdBy: string;
};