import { useEffect, useState } from "react";

import {
    getSingleStandlFromFirestore,
    updateOwnerStandlBaseInfoInFirestore,
} from "@/lib/standlService";
import type { Standl, StandlCategory } from "@/types/standl";

type UseEditStandlParams = {
    id?: string;
    userId?: string;
    isAuthLoading: boolean;
};

export function useEditStandl({
    id,
    userId,
    isAuthLoading,
}: UseEditStandlParams) {
    const [standl, setStandl] = useState<Standl | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] =
        useState<StandlCategory>("hendl");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        let isActive = true;

        async function loadStandl() {
            if (isAuthLoading) {
                return;
            }

            setIsLoading(true);
            setCanEdit(false);
            setStandl(null);

            if (!id) {
                setErrorMessage("Es wurde keine Standl-ID übergeben.");
                setIsLoading(false);
                return;
            }

            if (!userId) {
                setErrorMessage(
                    "Du musst eingeloggt sein, um ein Standl zu bearbeiten."
                );
                setIsLoading(false);
                return;
            }

            try {
                setErrorMessage("");

                const loadedStandl =
                    await getSingleStandlFromFirestore(id);

                if (!isActive) {
                    return;
                }

                if (!loadedStandl) {
                    setErrorMessage("Standl wurde nicht gefunden.");
                    return;
                }

                if (loadedStandl.ownerId !== userId) {
                    setErrorMessage(
                        "Dieses Standl gehört nicht zum eingeloggten Besitzerkonto."
                    );
                    return;
                }

                setStandl(loadedStandl);
                setName(loadedStandl.name);
                setCategory(loadedStandl.category);
                setCanEdit(true);
            } catch (error) {
                if (!isActive) {
                    return;
                }

                console.warn("Standl konnte nicht geladen werden:", error);
                setErrorMessage("Standl konnte nicht geladen werden.");
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        }

        loadStandl();

        return () => {
            isActive = false;
        };
    }, [id, userId, isAuthLoading]);

    async function updateStandl() {
        setErrorMessage("");

        if (!id || !userId || !canEdit) {
            setErrorMessage("Das Standl kann nicht bearbeitet werden.");
            return false;
        }

        if (name.trim().length < 2) {
            setErrorMessage("Bitte gib einen Namen für das Standl ein.");
            return false;
        }

        setIsSubmitting(true);

        try {
            await updateOwnerStandlBaseInfoInFirestore(id, userId, {
                name: name.trim(),
                category,
            });

            return true;
        } catch (error) {
            console.warn("Standl konnte nicht aktualisiert werden:", error);
            setErrorMessage("Standl konnte nicht aktualisiert werden.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        standl,
        name,
        setName,
        category,
        setCategory,
        errorMessage,
        isLoading,
        isSubmitting,
        canEdit,
        updateStandl,
    };
}
