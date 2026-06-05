import type { StandlFormValues } from "@/types/standlForm";

export function validateStandlForm(
    values: StandlFormValues
): string | null {
    if (values.name.trim().length < 2) {
        return "Bitte gib einen Namen ein.";
    }

    if (values.street.trim().length < 2) {
        return "Bitte gib eine Straße ein.";
    }

    if (values.postalCode.trim().length < 3) {
        return "Bitte gib eine PLZ ein.";
    }

    if (values.city.trim().length < 2) {
        return "Bitte gib einen Ort ein.";
    }

    if (!values.selectedLocation) {
        return values.locationInputMode === "address"
            ? "Bitte suche die Adresse oder bestätige den Standort auf der Karte."
            : "Bitte wähle einen Standort auf der Karte aus.";
    }

    return null;
}