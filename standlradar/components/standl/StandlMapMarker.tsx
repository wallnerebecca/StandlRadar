import { Marker } from "react-native-maps";

import type { Standl } from "@/types/standl";
import type { StandlLocation } from "@/types/standlLocation";

type StandlMapMarkerProps = {
    standl: Standl;
    location: StandlLocation;
    onPress: () => void;
};

export function StandlMapMarker({ standl, location, onPress }: StandlMapMarkerProps) {
    const markerImage =
        standl.category === "hendl"
            ? require("../../assets/images/map-pins/Pin_Hendl.png")
            : require("../../assets/images/map-pins/Pin_Fisch.png");

    return (
        <Marker
            coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
            }}
            onPress={onPress}
            anchor={{ x: 0.5, y: 1 }}
            image={markerImage}
        />
    );
}