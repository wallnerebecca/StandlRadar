import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";

import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";
import type {
    LocationInputMode,
    SelectedLocation,
} from "@/types/standlForm";

type StandlLocationInputProps = {
    locationInputMode: LocationInputMode;
    onChangeLocationInputMode: (mode: LocationInputMode) => void;

    locationName: string;
    onChangeLocationName: (value: string) => void;

    street: string;
    onChangeStreet: (value: string) => void;

    streetNumber: string;
    onChangeStreetNumber: (value: string) => void;

    postalCode: string;
    onChangePostalCode: (value: string) => void;

    city: string;
    onChangeCity: (value: string) => void;

    selectedLocation: SelectedLocation | null;
    mapRegion: Region;
    onChangeMapRegion: (region: Region) => void;
    onMapPress: (event: MapPressEvent) => void;

    isSearchingAddress: boolean;
    onSearchAddress: () => void;
};

export function StandlLocationInput({
    locationInputMode,
    onChangeLocationInputMode,

    locationName,
    onChangeLocationName,

    street,
    onChangeStreet,

    streetNumber,
    onChangeStreetNumber,

    postalCode,
    onChangePostalCode,

    city,
    onChangeCity,

    selectedLocation,
    mapRegion,
    onChangeMapRegion,
    onMapPress,

    isSearchingAddress,
    onSearchAddress,
}: StandlLocationInputProps) {
    return (
        <>
            <View style={styles.locationModeBox}>
                <Text style={styles.label}>Standort angeben über</Text>

                <View style={styles.locationModeButtons}>
                    <Pressable
                        onPress={() => onChangeLocationInputMode("address")}
                        style={[
                            styles.locationModeButton,
                            locationInputMode === "address" &&
                            styles.locationModeButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.locationModeButtonText,
                                locationInputMode === "address" &&
                                styles.locationModeButtonTextActive,
                            ]}
                        >
                            Adresse eingeben
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => onChangeLocationInputMode("pin")}
                        style={[
                            styles.locationModeButton,
                            locationInputMode === "pin" &&
                            styles.locationModeButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.locationModeButtonText,
                                locationInputMode === "pin" &&
                                styles.locationModeButtonTextActive,
                            ]}
                        >
                            Pin setzen
                        </Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.addressBox}>
                <Text style={styles.label}>
                    {locationInputMode === "address"
                        ? "Adresse oder Standortname"
                        : "Standortbeschreibung"}
                </Text>

                <TextInput
                    value={locationName}
                    onChangeText={onChangeLocationName}
                    placeholder="Standortbeschreibung"
                    placeholderTextColor={Theme.textSecondary}
                    style={styles.input}
                />

                <TextInput
                    value={street}
                    onChangeText={onChangeStreet}
                    placeholder="Straße"
                    placeholderTextColor={Theme.textSecondary}
                    style={styles.input}
                />

                <TextInput
                    value={streetNumber}
                    onChangeText={onChangeStreetNumber}
                    placeholder="Hausnummer"
                    placeholderTextColor={Theme.textSecondary}
                    style={styles.input}
                />

                <TextInput
                    value={postalCode}
                    onChangeText={onChangePostalCode}
                    placeholder="PLZ"
                    placeholderTextColor={Theme.textSecondary}
                    keyboardType="number-pad"
                    style={styles.input}
                />

                <TextInput
                    value={city}
                    onChangeText={onChangeCity}
                    placeholder="Ort"
                    placeholderTextColor={Theme.textSecondary}
                    style={styles.input}
                />

                {locationInputMode === "address" ? (
                    <>
                        <SecondaryButton
                            label={
                                isSearchingAddress
                                    ? "Adresse wird gesucht..."
                                    : "Adresse suchen"
                            }
                            onPress={() => {
                                if (!isSearchingAddress) {
                                    onSearchAddress();
                                }
                            }}
                        />

                        <Text style={styles.mapHint}>
                            Die Adresse wird auf der Karte gesucht. Du kannst den Pin
                            danach noch manuell korrigieren.
                        </Text>
                    </>
                ) : (
                    <Text style={styles.mapHint}>
                        Du kannst Ort und PLZ nach dem Setzen des Pins bei Bedarf
                        manuell korrigieren.
                    </Text>
                )}
            </View>

            <View style={styles.mapSection}>
                <Text style={styles.label}>
                    {locationInputMode === "address"
                        ? "Standort auf der Karte bestätigen"
                        : "Standort auf der Karte auswählen"}
                </Text>

                <Text style={styles.mapHint}>
                    {locationInputMode === "address"
                        ? "Die Karte zeigt die gefundene Adresse. Du kannst den Pin bei Bedarf korrigieren."
                        : "Tippe auf die Karte, um den Standort des Standl zu setzen."}
                </Text>

                <MapView
                    style={styles.locationMap}
                    region={mapRegion}
                    onRegionChangeComplete={onChangeMapRegion}
                    onPress={onMapPress}
                >
                    {selectedLocation ? (
                        <Marker coordinate={selectedLocation} anchor={{ x: 0.5, y: 1 }} />
                    ) : null}
                </MapView>

                {selectedLocation ? (
                    <Text style={styles.selectedLocationText}>
                        Ausgewählt: {selectedLocation.latitude.toFixed(5)},{" "}
                        {selectedLocation.longitude.toFixed(5)}
                    </Text>
                ) : (
                    <Text style={styles.selectedLocationText}>
                        Noch kein Standort ausgewählt.
                    </Text>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        color: Theme.textPrimary,
        fontSize: 16,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    locationModeBox: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    locationModeButtons: {
        flexDirection: "row",
        gap: 8,
    },
    locationModeButton: {
        flex: 1,
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 11,
        paddingHorizontal: 10,
        alignItems: "center",
    },
    locationModeButtonActive: {
        backgroundColor: Theme.secondary,
        borderColor: Theme.secondary,
    },
    locationModeButtonText: {
        color: Theme.textSecondary,
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    locationModeButtonTextActive: {
        color: Theme.textPrimary,
    },
    addressBox: {
        gap: 10,
    },
    mapSection: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 10,
    },
    mapHint: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    locationMap: {
        height: 240,
        borderRadius: 14,
        overflow: "hidden",
    },
    selectedLocationText: {
        color: Theme.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
});