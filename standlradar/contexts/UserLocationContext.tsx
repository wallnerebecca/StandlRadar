import * as Location from "expo-location";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    AppState,
    Linking,
    type AppStateStatus,
} from "react-native";

type UserCoordinates = {
    latitude: number;
    longitude: number;
};

export type LocationPermissionStatus =
    | "loading"
    | "granted"
    | "undetermined"
    | "denied"
    | "blocked";

type UserLocationContextValue = {
    permissionStatus: LocationPermissionStatus;
    userLocation: UserCoordinates | null;
    isLoadingLocation: boolean;
    errorMessage: string;
    requestLocationPermission: () => Promise<boolean>;
    refreshLocationPermission: () => Promise<void>;
    refreshUserLocation: () => Promise<void>;
    openLocationSettings: () => Promise<void>;
};

const UserLocationContext =
    createContext<UserLocationContextValue | undefined>(undefined);

function mapPermissionStatus(
    permission: Location.LocationPermissionResponse
): LocationPermissionStatus {
    if (permission.granted) {
        return "granted";
    }

    if (permission.status === Location.PermissionStatus.UNDETERMINED) {
        return "undetermined";
    }

    if (!permission.canAskAgain) {
        return "blocked";
    }

    return "denied";
}

export function UserLocationProvider({ children }: PropsWithChildren) {
    const [permissionStatus, setPermissionStatus] =
        useState<LocationPermissionStatus>("loading");

    const [userLocation, setUserLocation] =
        useState<UserCoordinates | null>(null);

    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const loadCurrentLocation = useCallback(async () => {
        setIsLoadingLocation(true);
        setErrorMessage("");

        try {
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        } catch (error) {
            console.warn(
                "Aktueller Standort konnte nicht geladen werden:",
                error
            );

            setUserLocation(null);
            setErrorMessage(
                "Der aktuelle Standort konnte nicht bestimmt werden."
            );
        } finally {
            setIsLoadingLocation(false);
        }
    }, []);

    const refreshLocationPermission = useCallback(async () => {
        try {
            const permission =
                await Location.getForegroundPermissionsAsync();

            const nextStatus = mapPermissionStatus(permission);

            setPermissionStatus(nextStatus);

            if (nextStatus === "granted") {
                await loadCurrentLocation();
                return;
            }

            setUserLocation(null);
        } catch (error) {
            console.warn(
                "Standortberechtigung konnte nicht geprüft werden:",
                error
            );

            setPermissionStatus("denied");
            setUserLocation(null);
            setErrorMessage(
                "Die Standortberechtigung konnte nicht geprüft werden."
            );
        }
    }, [loadCurrentLocation]);

    const requestLocationPermission = useCallback(async () => {
        setErrorMessage("");

        try {
            const permission =
                await Location.requestForegroundPermissionsAsync();

            const nextStatus = mapPermissionStatus(permission);

            setPermissionStatus(nextStatus);

            if (nextStatus !== "granted") {
                setUserLocation(null);
                return false;
            }

            await loadCurrentLocation();
            return true;
        } catch (error) {
            console.warn(
                "Standortberechtigung konnte nicht angefragt werden:",
                error
            );

            setErrorMessage(
                "Die Standortfreigabe konnte nicht angefragt werden."
            );

            return false;
        }
    }, [loadCurrentLocation]);

    const refreshUserLocation = useCallback(async () => {
        const permission =
            await Location.getForegroundPermissionsAsync();

        const nextStatus = mapPermissionStatus(permission);

        setPermissionStatus(nextStatus);

        if (nextStatus !== "granted") {
            setUserLocation(null);
            return;
        }

        await loadCurrentLocation();
    }, [loadCurrentLocation]);

    const openLocationSettings = useCallback(async () => {
        try {
            await Linking.openSettings();
        } catch (error) {
            console.warn(
                "App-Einstellungen konnten nicht geöffnet werden:",
                error
            );

            setErrorMessage(
                "Die App-Einstellungen konnten nicht geöffnet werden."
            );
        }
    }, []);

    useEffect(() => {
        refreshLocationPermission();
    }, [refreshLocationPermission]);

    useEffect(() => {
        function handleAppStateChange(nextState: AppStateStatus) {
            if (nextState === "active") {
                refreshLocationPermission();
            }
        }

        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        return () => {
            subscription.remove();
        };
    }, [refreshLocationPermission]);

    const value = useMemo(
        () => ({
            permissionStatus,
            userLocation,
            isLoadingLocation,
            errorMessage,
            requestLocationPermission,
            refreshLocationPermission,
            refreshUserLocation,
            openLocationSettings,
        }),
        [
            permissionStatus,
            userLocation,
            isLoadingLocation,
            errorMessage,
            requestLocationPermission,
            refreshLocationPermission,
            refreshUserLocation,
            openLocationSettings,
        ]
    );

    return (
        <UserLocationContext.Provider value={value}>
            {children}
        </UserLocationContext.Provider>
    );
}

export function useUserLocation() {
    const context = useContext(UserLocationContext);

    if (!context) {
        throw new Error(
            "useUserLocation must be used inside UserLocationProvider"
        );
    }

    return context;
}