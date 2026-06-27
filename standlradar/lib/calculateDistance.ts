type Coordinates = {
    latitude: number;
    longitude: number;
};

function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

export function calculateDistanceKm(
    from: Coordinates,
    to: Coordinates
) {
    const earthRadiusKm = 6371;

    const latitudeDifference = toRadians(
        to.latitude - from.latitude
    );

    const longitudeDifference = toRadians(
        to.longitude - from.longitude
    );

    const fromLatitude = toRadians(from.latitude);
    const toLatitude = toRadians(to.latitude);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(fromLatitude) *
        Math.cos(toLatitude) *
        Math.sin(longitudeDifference / 2) ** 2;

    const centralAngle =
        2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * centralAngle;
}