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
    street?: string;
    streetNumber?: string;
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
    ownerId?: string;
    distanceKm?: number;
    createdBy?: string;
    source?: "owner" | "community";
};