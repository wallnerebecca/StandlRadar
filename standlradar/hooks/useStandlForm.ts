import { useState } from "react";

import { useStandlLocationForm } from "@/hooks/useStandlLocationForm";
import { validateStandlForm } from "@/lib/validateStandlForm";
import type { Standl, StandlCategory } from "@/types/standl";

export function useStandlForm() {
    const [name, setName] = useState("");
    const [category, setCategory] =
        useState<StandlCategory>("hendl");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locationForm = useStandlLocationForm(setErrorMessage);

    function validate() {
        const validationError = validateStandlForm({
            name,
            category,
            locationInputMode: locationForm.locationInputMode,
            locationName: locationForm.locationName,
            street: locationForm.street,
            streetNumber: locationForm.streetNumber,
            postalCode: locationForm.postalCode,
            city: locationForm.city,
            selectedLocation: locationForm.selectedLocation,
        });

        setErrorMessage(validationError ?? "");

        return validationError === null;
    }

    function getEditableFields() {
        if (!locationForm.selectedLocation) {
            return null;
        }

        return {
            name: name.trim(),
            category,
            locationName: locationForm.locationName.trim(),
            street: locationForm.street.trim(),
            streetNumber: locationForm.streetNumber.trim(),
            postalCode: locationForm.postalCode.trim(),
            city: locationForm.city.trim(),
            latitude: locationForm.selectedLocation.latitude,
            longitude: locationForm.selectedLocation.longitude,
        };
    }

    function fillFromStandl(standl: Standl) {
        setName(standl.name);
        setCategory(standl.category);

        locationForm.setLocationName(standl.locationName);
        locationForm.setStreet(standl.street ?? "");
        locationForm.setStreetNumber(standl.streetNumber ?? "");
        locationForm.setPostalCode(standl.postalCode);
        locationForm.setCity(standl.city);

        locationForm.setSelectedLocation({
            latitude: standl.latitude,
            longitude: standl.longitude,
        });

        locationForm.setMapRegion({
            latitude: standl.latitude,
            longitude: standl.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        });
    }

    return {
        name,
        setName,
        category,
        setCategory,
        errorMessage,
        setErrorMessage,
        isSubmitting,
        setIsSubmitting,
        locationForm,
        validate,
        getEditableFields,
        fillFromStandl,
    };
}