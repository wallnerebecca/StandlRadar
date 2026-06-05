import { useRef, useState } from "react";
import { ScrollView } from "react-native";
import type { MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";

import { useUserLocation } from "@/contexts/UserLocationContext";

import type { LocationInputMode, SelectedLocation } from "@/types/standlForm";

const INITIAL_MAP_REGION: Region = {
    latitude: 48.3069,
    longitude: 14.2858,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
};

export function useStandlLocationForm(
    setErrorMessage: (message: string) => void
) {
    const {
        permissionStatus,
        requestLocationPermission,
    } = useUserLocation();

    const scrollViewRef = useRef<ScrollView | null>(null);

    const [locationInputMode, setLocationInputMode] =
        useState<LocationInputMode>("address");

    const [locationName, setLocationName] = useState("");
    const [street, setStreet] = useState("");
    const [streetNumber, setStreetNumber] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");

    const [selectedLocation, setSelectedLocation] =
        useState<SelectedLocation | null>(null);

    const [mapRegion, setMapRegion] = useState<Region>(INITIAL_MAP_REGION);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);

    function handleLocationInputModeChange(nextMode: LocationInputMode) {
        setLocationInputMode(nextMode);

        if (nextMode === "pin") {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({
                    y: 520,
                    animated: true,
                });
            }, 100);
        }
    }

    async function ensureLocationPermission() {
        if (permissionStatus === "granted") {
            return true;
        }

        const granted = await requestLocationPermission();

        if (!granted) {
            setErrorMessage(
                "Für die automatische Adresssuche braucht StandlRadar Zugriff auf Standortdienste. Du kannst die Angaben auch manuell eintragen."
            );
        }

        return granted;
    }

    async function handleMapPress(event: MapPressEvent) {
        const coordinate = event.nativeEvent.coordinate;

        setSelectedLocation(coordinate);
        setMapRegion((current) => ({
            ...current,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
        }));

        if (locationInputMode !== "pin") {
            return;
        }

        try {
            const hasPermission = await ensureLocationPermission();

            if (!hasPermission) {
                return;
            }
            const results = await Location.reverseGeocodeAsync(coordinate);

            if (results.length === 0) {
                return;
            }

            const firstResult = results[0];

            if (firstResult.city) {
                setCity(firstResult.city);
            }

            if (firstResult.postalCode) {
                setPostalCode(firstResult.postalCode);
            }

            if (firstResult.street) {
                setStreet(firstResult.street);
            }

            if (firstResult.streetNumber) {
                setStreetNumber(firstResult.streetNumber ?? "");
            }


        } catch (error) {
            console.warn("Adresse zum Pin konnte nicht geladen werden:", error);
        }
    }

    async function handleSearchAddress() {
        setErrorMessage("");

        if (street.trim().length < 2 || city.trim().length < 2) {
            setErrorMessage("Bitte gib zumindest Straße und Ort ein.");
            return;
        }

        setIsSearchingAddress(true);

        try {
            const hasPermission = await ensureLocationPermission();

            if (!hasPermission) {
                return;
            }

            const searchQuery = [
                `${street.trim()} ${streetNumber.trim()}`.trim(),
                postalCode.trim(),
                city.trim(),
                "Österreich",
            ]
                .filter(Boolean)
                .join(", ");

            const results = await Location.geocodeAsync(searchQuery);

            if (results.length === 0) {
                setErrorMessage("Adresse konnte nicht gefunden werden.");
                return;
            }

            const firstResult = results[0];

            const nextLocation = {
                latitude: firstResult.latitude,
                longitude: firstResult.longitude,
            };

            setSelectedLocation(nextLocation);
            setMapRegion({
                latitude: firstResult.latitude,
                longitude: firstResult.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        } catch (error) {
            console.warn("Adresse konnte nicht gesucht werden:", error);
            setErrorMessage("Adresse konnte nicht gesucht werden.");
        } finally {
            setIsSearchingAddress(false);
        }
    }

    return {
        scrollViewRef,

        locationInputMode,
        handleLocationInputModeChange,

        locationName,
        setLocationName,
        street,
        setStreet,
        streetNumber,
        setStreetNumber,
        postalCode,
        setPostalCode,
        city,
        setCity,

        selectedLocation,
        setSelectedLocation,
        mapRegion,
        setMapRegion,

        isSearchingAddress,
        handleSearchAddress,
        handleMapPress,
    };
}