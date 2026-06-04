import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    addUserFavoriteStandl,
    getUserFavoriteStandlIds,
    removeUserFavoriteStandl,
    saveUserFavoriteStandlIds,
} from "@/lib/favoriteService";

const FAVORITES_STORAGE_KEY = "standlradar:favorites";

type FavoritesContextValue = {
    favoriteStandlIds: string[];
    isLoading: boolean;
    isSyncing: boolean;
    isFavorite: (standlId: string) => boolean;
    toggleFavorite: (standlId: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
    undefined
);

export function FavoritesProvider({ children }: PropsWithChildren) {

    const { user } = useAuth();

    const [favoriteStandlIds, setFavoriteStandlIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const lastSyncedUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        async function loadFavorites() {
            try {
                const storedValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

                if (!storedValue) {
                    setFavoriteStandlIds([]);
                    return;
                }

                const parsedValue = JSON.parse(storedValue);

                if (Array.isArray(parsedValue)) {
                    setFavoriteStandlIds(parsedValue);
                } else {
                    setFavoriteStandlIds([]);
                }
            } catch (error) {
                console.warn("Favoriten konnten nicht geladen werden:", error);
                setFavoriteStandlIds([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadFavorites();
    }, []);

    useEffect(() => {
        async function syncFavoritesAfterLogin() {
            if (!user || isLoading) {
                lastSyncedUserIdRef.current = null;
                return;
            }

            if (lastSyncedUserIdRef.current === user.uid) {
                return;
            }

            lastSyncedUserIdRef.current = user.uid;

            setIsSyncing(true);

            try {
                const remoteFavoriteStandlIds = await getUserFavoriteStandlIds(user.uid);

                const mergedFavoriteStandlIds = Array.from(
                    new Set([...favoriteStandlIds, ...remoteFavoriteStandlIds])
                );

                await saveFavorites(mergedFavoriteStandlIds);
                await saveUserFavoriteStandlIds(user.uid, mergedFavoriteStandlIds);
            } catch (error) {
                console.warn("Favoriten konnten nicht synchronisiert werden:", error);
                lastSyncedUserIdRef.current = null;
            } finally {
                setIsSyncing(false);
            }
        }

        syncFavoritesAfterLogin();
    }, [user, isLoading]);

    const saveFavorites = useCallback(async (nextFavoriteStandlIds: string[]) => {
        try {
            setFavoriteStandlIds(nextFavoriteStandlIds);

            await AsyncStorage.setItem(
                FAVORITES_STORAGE_KEY,
                JSON.stringify(nextFavoriteStandlIds)
            );
        } catch (error) {
            console.warn("Favoriten konnten nicht gespeichert werden:", error);
        }
    }, []);

    const isFavorite = useCallback(
        (standlId: string) => {
            return favoriteStandlIds.includes(standlId);
        },
        [favoriteStandlIds]
    );

    const toggleFavorite = useCallback(
        async (standlId: string) => {
            const alreadyFavorite = favoriteStandlIds.includes(standlId);

            const nextFavoriteStandlIds = alreadyFavorite
                ? favoriteStandlIds.filter((id) => id !== standlId)
                : [...favoriteStandlIds, standlId];

            await saveFavorites(nextFavoriteStandlIds);

            if (!user) {
                return;
            }

            if (alreadyFavorite) {
                await removeUserFavoriteStandl(user.uid, standlId);
                return;
            }

            await addUserFavoriteStandl(user.uid, standlId);
        },
        [favoriteStandlIds, saveFavorites, user]
    );

    const value = useMemo(
        () => ({
            favoriteStandlIds,
            isLoading,
            isSyncing,
            isFavorite,
            toggleFavorite,
        }),
        [favoriteStandlIds, isLoading, isSyncing, isFavorite, toggleFavorite]
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error("useFavorites must be used inside FavoritesProvider");
    }

    return context;
}