import type { Standl, StandlCategory } from "@/types/standl";

export type CategoryFilter = "all" | StandlCategory;

type FilterStandlParams = {
    standl: Standl[];
    searchQuery?: string;
    selectedCategory?: CategoryFilter;
    showOpenOnly?: boolean;
    favoriteStandlIds?: string[];
    showFavoritesOnly?: boolean;
};

export function filterStandl({
    standl,
    searchQuery = "",
    selectedCategory = "all",
    showOpenOnly = false,
    favoriteStandlIds = [],
    showFavoritesOnly = false,
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
            ["open", "likelyOpen"].includes(item.openingStatus.type)
        );
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length > 0) {
        result = result.filter((item) => {
            return (
                item.name.toLowerCase().includes(normalizedQuery) ||
                item.city.toLowerCase().includes(normalizedQuery) ||
                item.locationName.toLowerCase().includes(normalizedQuery) ||
                item.postalCode.includes(normalizedQuery)
            );
        });
    }

    return result;
}