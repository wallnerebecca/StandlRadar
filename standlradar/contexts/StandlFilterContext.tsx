import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";

import type { CategoryFilter } from "@/lib/filterStandl";

type StandlFilterContextValue = {
    selectedCategory: CategoryFilter;
    setSelectedCategory: (category: CategoryFilter) => void;
    showOpenOnly: boolean;
    setShowOpenOnly: (value: boolean) => void;
    toggleOpenOnly: () => void;
    resetFilters: () => void;
};

const StandlFilterContext = createContext<
    StandlFilterContextValue | undefined
>(undefined);

export function StandlFilterProvider({ children }: PropsWithChildren) {
    const [selectedCategory, setSelectedCategory] =
        useState<CategoryFilter>("all");
    const [showOpenOnly, setShowOpenOnly] = useState(false);

    function toggleOpenOnly() {
        setShowOpenOnly((current) => !current);
    }

    function resetFilters() {
        setSelectedCategory("all");
        setShowOpenOnly(false);
    }

    const value = useMemo(
        () => ({
            selectedCategory,
            setSelectedCategory,
            showOpenOnly,
            setShowOpenOnly,
            toggleOpenOnly,
            resetFilters,
        }),
        [selectedCategory, showOpenOnly]
    );

    return (
        <StandlFilterContext.Provider value={value}>
            {children}
        </StandlFilterContext.Provider>
    );
}

export function useStandlFilters() {
    const context = useContext(StandlFilterContext);

    if (!context) {
        throw new Error("useStandlFilters must be used inside StandlFilterProvider");
    }

    return context;
}