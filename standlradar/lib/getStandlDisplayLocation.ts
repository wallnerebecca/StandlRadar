import { calculateDistanceKm } from "@/lib/calculateDistance";
import { getLocationOpeningStatus } from "@/lib/getLocationOpeningStatus";
import type { Standl } from "@/types/standl";
import type { StandlLocation } from "@/types/standlLocation";

type Coordinates = {
    latitude: number;
    longitude: number;
};

function getNearestLocation(
    locations: StandlLocation[],
    userLocation?: Coordinates | null
) {
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

export function getStandlDisplayLocation(
    standl: Standl,
    userLocation?: Coordinates | null,
    currentDate = new Date()
): StandlLocation | undefined {
    const locations = standl.locations;

    if (!locations || locations.length === 0) {
        return undefined;
    }

    const openLocations = locations.filter(
        (location) =>
            getLocationOpeningStatus(location, currentDate).type === "open"
    );

    if (openLocations.length > 0) {
        return getNearestLocation(openLocations, userLocation);
    }

    const opensLaterLocations = locations.filter(
        (location) =>
            getLocationOpeningStatus(location, currentDate).type === "opensLater"
    );

    if (opensLaterLocations.length > 0) {
        return getNearestLocation(opensLaterLocations, userLocation);
    }

    return getNearestLocation(locations, userLocation);
}