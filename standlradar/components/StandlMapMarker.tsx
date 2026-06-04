import { Marker } from "react-native-maps";

import type { Standl } from "@/types/standl";

type StandlMapMarkerProps = {
    standl: Standl;
    onPress: () => void;
};

export function StandlMapMarker({ standl, onPress }: StandlMapMarkerProps) {
    const markerImage =
        standl.category === "hendl"
            ? require("../assets/images/map-pins/Pin_Hendl.png")
            : require("../assets/images/map-pins/Pin_Fisch.png");

    return (
        <Marker
            coordinate={{
                latitude: standl.latitude,
                longitude: standl.longitude,
            }}
            onPress={onPress}
            anchor={{ x: 0.5, y: 1 }}
            image={markerImage}
        />
    );
}