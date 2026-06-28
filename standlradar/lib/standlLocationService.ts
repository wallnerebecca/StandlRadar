import {
    addDoc,
    updateDoc,
    doc,
    collection,
    collectionGroup,
    GeoPoint,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

import {
    getAllStandlSchedules,
    getStandlLocationSchedules,
} from "@/lib/standlScheduleService";
import { firestoreDb } from "@/lib/firebase";
import type { StandlLocation } from "@/types/standlLocation";
import type { StandlSchedule } from "@/types/standlSchedule";

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

type UpdateStandlLocationInput = {
    standlId: string;
    locationId: string;
    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
};

type FirestoreStandlLocation = {
    locationName?: string;
    street?: string;
    streetNumber?: string;
    postalCode?: string;
    city?: string;
    location?: GeoPoint;
    source?: StandlLocation["source"];
    status?: StandlLocation["status"];
    createdBy?: string;
};

function createLocationKey(standlId: string, locationId: string) {
    return `${standlId}/${locationId}`;
}

function mapFirestoreStandlLocation(
    locationId: string,
    standlId: string,
    data: FirestoreStandlLocation,
    schedules: StandlSchedule[]
): StandlLocation {
    if (!data.location) {
        throw new Error(
            `Standort ${locationId} hat keinen GeoPoint.`
        );
    }

    return {
        id: locationId,
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
}

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

    const standlRef = doc(
        firestoreDb,
        "standl",
        input.standlId
    );

    await updateDoc(standlRef, {
        updatedAt: serverTimestamp(),
    });

    return createdLocation.id;
}

export async function updateStandlLocation(
    input: UpdateStandlLocationInput
) {
    const locationRef = doc(
        firestoreDb,
        "standl",
        input.standlId,
        "locations",
        input.locationId
    );

    await updateDoc(locationRef, {
        locationName: input.locationName,
        street: input.street,
        streetNumber: input.streetNumber,
        postalCode: input.postalCode,
        city: input.city,
        location: new GeoPoint(
            input.latitude,
            input.longitude
        ),
        updatedAt: serverTimestamp(),
    });

    const standlRef = doc(
        firestoreDb,
        "standl",
        input.standlId
    );

    await updateDoc(standlRef, {
        updatedAt: serverTimestamp(),
    });
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

    return Promise.all(
        snapshot.docs.map(async (locationDoc) => {
            const schedules = await getStandlLocationSchedules(
                standlId,
                locationDoc.id
            );

            return mapFirestoreStandlLocation(
                locationDoc.id,
                standlId,
                locationDoc.data() as FirestoreStandlLocation,
                schedules
            );
        })
    );
}

export async function getAllStandlLocations(): Promise<StandlLocation[]> {
    const locationsRef = collectionGroup(firestoreDb, "locations");

    const [snapshot, schedules] = await Promise.all([
        getDocs(locationsRef),
        getAllStandlSchedules(),
    ]);

    const schedulesByLocation = new Map<string, StandlSchedule[]>();

    schedules.forEach((schedule) => {
        const key = createLocationKey(
            schedule.standlId,
            schedule.locationId
        );
        const currentSchedules = schedulesByLocation.get(key) ?? [];
        currentSchedules.push(schedule);
        schedulesByLocation.set(key, currentSchedules);
    });

    return snapshot.docs.map((locationDoc) => {
        const standlRef = locationDoc.ref.parent.parent;

        if (
            !standlRef ||
            locationDoc.ref.parent.id !== "locations" ||
            standlRef.parent.id !== "standl"
        ) {
            throw new Error(
                `Standort ${locationDoc.id} liegt nicht unter einem Standl.`
            );
        }

        const schedulesForLocation =
            schedulesByLocation.get(
                createLocationKey(standlRef.id, locationDoc.id)
            ) ?? [];

        return mapFirestoreStandlLocation(
            locationDoc.id,
            standlRef.id,
            locationDoc.data() as FirestoreStandlLocation,
            schedulesForLocation
        );
    });
}
