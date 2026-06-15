import { calculateDistanceKm } from "@/lib/calculateDistance";
import type { Standl } from "@/types/standl";
import type { StandlLocation } from "@/types/standlLocation";

type Coordinates = {
    latitude: number;
    longitude: number;
};

export function getStandlDisplayLocation(
    standl: Standl,
    userLocation?: Coordinates | null
): StandlLocation | undefined {
    const locations = standl.locations;

    if (!locations || locations.length === 0) {
        return undefined;
    }

    if (!userLocation) {
        return locations[0];
    }

    return locations.reduce((nearestLocation, currentLocation) => {
        const nearestDistance = calculateDistanceKm(
            userLocation,
            nearestLocation
        );

        const currentDistance = calculateDistanceKm(
            userLocation,
            currentLocation
        );

        return currentDistance < nearestDistance
            ? currentLocation
            : nearestLocation;
    });
}