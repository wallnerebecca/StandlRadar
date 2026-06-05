import { Linking } from "react-native";

type NavigationDestination = {
    latitude: number;
    longitude: number;
};

export async function openNavigation(
    destination: NavigationDestination
) {
    const coordinates =
        `${destination.latitude},${destination.longitude}`;

    const mapsUrl =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${encodeURIComponent(coordinates)}` +
        `&travelmode=driving`;

    try {
        await Linking.openURL(mapsUrl);
    } catch (error) {
        console.warn("Navigation konnte nicht geöffnet werden:", error);
    }
}