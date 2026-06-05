import type { StandlCategory } from "@/types/standl";

export type AddMode = "owner" | "community";

export type LocationInputMode = "address" | "pin";

export type SelectedLocation = {
    latitude: number;
    longitude: number;
};

export type StandlFormValues = {
    name: string;
    category: StandlCategory;
    locationInputMode: LocationInputMode;
    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;
    selectedLocation: SelectedLocation | null;
};