import type { Standl, StandlCategory } from "@/types/standl";
import { getLocationOpeningStatus } from "@/lib/getLocationOpeningStatus";

export type CategoryFilter = "all" | StandlCategory;

type FilterStandlParams = {
    standl: Standl[];
    searchQuery?: string;
    selectedCategory?: CategoryFilter;
    showOpenOnly?: boolean;
    favoriteStandlIds?: string[];
    showFavoritesOnly?: boolean;
    currentDate?: Date;
};

export function filterStandl({
    standl,
    searchQuery = "",
    selectedCategory = "all",
    showOpenOnly = false,
    favoriteStandlIds = [],
    showFavoritesOnly = false,
    currentDate = new Date(),
}: FilterStandlParams) {
    let result = standl;

    if (showFavoritesOnly) {
        result = result.filter((item) => favoriteStandlIds.includes(item.id));
    }

    if (selectedCategory !== "all") {
        result = result.filter((item) => item.category === selectedCategory);
    }

    if (showOpenOnly) {
        result = result.filter((item) =>
            (item.locations ?? []).some(
                (location) =>
                    getLocationOpeningStatus(location, currentDate).type === "open"
            )
        );
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length > 0) {
        result = result.filter((item) => {
            const matchesStandlName = item.name
                .toLowerCase()
                .includes(normalizedQuery);

            const matchesLocation = (item.locations ?? []).some((location) =>
                location.locationName.toLowerCase().includes(normalizedQuery) ||
                location.city.toLowerCase().includes(normalizedQuery) ||
                location.street.toLowerCase().includes(normalizedQuery) ||
                location.postalCode.includes(normalizedQuery)
            );

            return matchesStandlName || matchesLocation;
        });
    }

    return result;
}