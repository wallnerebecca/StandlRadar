import { useEffect, useState } from "react";

import { subscribeToStandlFromFirestore } from "@/lib/standlService";
import type { Standl } from "@/types/standl";


export function useStandl() {
    const [standl, setStandl] = useState<Standl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        return subscribeToStandlFromFirestore(
            (firestoreStandl) => {
                setStandl(firestoreStandl);
                setErrorMessage("");
                setIsLoading(false);
            },
            (error) => {
                console.warn("Standl konnten nicht geladen werden:", error);
                setErrorMessage("Standl konnten nicht geladen werden.");
                setIsLoading(false);
            }
        );
    }, []);

    return {
        standl,
        isLoading,
        errorMessage,
    };
};
