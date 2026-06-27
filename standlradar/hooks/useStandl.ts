import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { getStandlFromFirestore } from "@/lib/standlService";
import { mapFirestoreStandl } from "@/lib/standlService";
import type { Standl } from "@/types/standl";
import { firestoreDb } from "@/lib/firebase";


export function useStandl() {
    const [standl, setStandl] = useState<Standl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const standlRef = collection(firestoreDb, "standl");

        const unsubscribe = onSnapshot(standlRef, (snapshot) => {
            try {
                const firestoreStandl: Standl[] = snapshot.docs.map((standlDoc) => {
                    return mapFirestoreStandl(standlDoc.id, standlDoc.data());
                });

                setErrorMessage("");
                setStandl(firestoreStandl);
            } catch (error) {
                console.warn("Standl konnten nicht geladen werden:", error);
                setErrorMessage("Standl konnten nicht geladen werden.");
            } finally {
                setIsLoading(false);
            }
        },
            (error) => {
                console.warn("Standl konnten nicht geladen werden:", error);
                setErrorMessage("Standl konnten nicht geladen werden.");
                setIsLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    return {
        standl,
        isLoading,
        errorMessage,
    };
};