import { StyleSheet, Text, View } from "react-native";

import { StandlBasicInfoForm } from "@/components/standlForm/StandlBasicInfoForm";
import { StandlLocationInput } from "@/components/standlForm/StandlLocationInput";
import { Theme } from "@/constants/colors";
import type { StandlLocationFormState } from "@/hooks/useStandlLocationForm";
import type { StandlCategory } from "@/types/standl";

type StandlFormFieldsProps = {
    name: string;
    onChangeName: (value: string) => void;
    category: StandlCategory;
    onChangeCategory: (category: StandlCategory) => void;
    locationForm: StandlLocationFormState;
    errorMessage: string;
};

export function StandlFormFields({
    name,
    onChangeName,
    category,
    onChangeCategory,
    locationForm,
    errorMessage,
}: StandlFormFieldsProps) {
    return (
        <View style={styles.fields}>
            <StandlBasicInfoForm
                name={name}
                onChangeName={onChangeName}
                category={category}
                onChangeCategory={onChangeCategory}
            />

            <StandlLocationInput
                locationInputMode={locationForm.locationInputMode}
                onChangeLocationInputMode={
                    locationForm.handleLocationInputModeChange
                }
                locationName={locationForm.locationName}
                onChangeLocationName={locationForm.setLocationName}
                street={locationForm.street}
                onChangeStreet={locationForm.setStreet}
                streetNumber={locationForm.streetNumber}
                onChangeStreetNumber={locationForm.setStreetNumber}
                postalCode={locationForm.postalCode}
                onChangePostalCode={locationForm.setPostalCode}
                city={locationForm.city}
                onChangeCity={locationForm.setCity}
                selectedLocation={locationForm.selectedLocation}
                mapRegion={locationForm.mapRegion}
                onChangeMapRegion={locationForm.setMapRegion}
                onMapPress={locationForm.handleMapPress}
                isSearchingAddress={locationForm.isSearchingAddress}
                onSearchAddress={locationForm.handleSearchAddress}
            />

            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    fields: {
        gap: 12,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
});