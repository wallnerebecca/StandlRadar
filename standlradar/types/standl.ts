export type StandlCategory = "hendl" | "steckerlfisch";

export type OpeningStatusType =
    | "open"
    | "likelyOpen"
    | "opensLater"
    | "closed"
    | "temporaryClosed"
    | "unknown";

export type Standl = {
    id: string;
    name: string;
    category: StandlCategory;
    locationName: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
    openingStatus: {
        type: OpeningStatusType;
        label: string;
        source: "owner" | "community" | "unknown";
    };
    likes: number;
    isClaimed: boolean;
    distanceKm?: number;
};