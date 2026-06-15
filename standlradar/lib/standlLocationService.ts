import {
    addDoc,
    collection,
    GeoPoint,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

import { getStandlLocationSchedules } from "@/lib/standlScheduleService";
import { firestoreDb } from "@/lib/firebase";
import type { StandlLocation } from "@/types/standlLocation";

type CreateStandlLocationInput = {
    standlId: string;
    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
    source: StandlLocation["source"];
    status: StandlLocation["status"];
    createdBy: string;
};

export async function createStandlLocation(
    input: CreateStandlLocationInput
) {
    const locationsRef = collection(
        firestoreDb,
        "standl",
        input.standlId,
        "locations"
    );

    const locationData = {
        locationName: input.locationName,
        street: input.street,
        streetNumber: input.streetNumber,
        postalCode: input.postalCode,
        city: input.city,
        location: new GeoPoint(
            input.latitude,
            input.longitude
        ),
        source: input.source,
        status: input.status,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const createdLocation = await addDoc(
        locationsRef,
        locationData
    );

    return createdLocation.id;
}

export async function getStandlLocations(
    standlId: string
): Promise<StandlLocation[]> {
    const locationsRef = collection(
        firestoreDb,
        "standl",
        standlId,
        "locations"
    );

    const snapshot = await getDocs(locationsRef);

    const locations = await Promise.all(
        snapshot.docs.map(async (locationDoc) => {
            const data = locationDoc.data();

            if (!data.location) {
                throw new Error(
                    `Standort ${locationDoc.id} hat keinen GeoPoint.`
                );
            }

            const schedules = await getStandlLocationSchedules(
                standlId,
                locationDoc.id
            );

            return {
                id: locationDoc.id,
                standlId,
                locationName: data.locationName ?? "",
                street: data.street ?? "",
                streetNumber: data.streetNumber ?? "",
                postalCode: data.postalCode ?? "",
                city: data.city ?? "",
                latitude: data.location.latitude,
                longitude: data.location.longitude,
                source: data.source ?? "community",
                status: data.status ?? "pending",
                createdBy: data.createdBy ?? "",
                schedules,
            };
        })
    );
    return locations;
}