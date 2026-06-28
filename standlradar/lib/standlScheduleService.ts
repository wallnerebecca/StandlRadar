import {
    addDoc,
    doc,
    updateDoc,
    writeBatch,
    collection,
    collectionGroup,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

import { firestoreDb } from "@/lib/firebase";
import type {
    StandlSchedule,
    Weekday,
} from "@/types/standlSchedule";

type CreateStandlScheduleInput = {
    standlId: string;
    locationId: string;
    weekday: Weekday;
    startTime: string;
    endTime: string;
    source: StandlSchedule["source"];
    status: StandlSchedule["status"];
    createdBy: string;
};

type ReplaceStandlSchedulesInput = {
    standlId: string;
    locationId: string;
    schedules: Array<{
        weekday: Weekday;
        startTime: string;
        endTime: string;
    }>;
    source: StandlSchedule["source"];
    status: StandlSchedule["status"];
    createdBy: string;
};

type FirestoreStandlSchedule = {
    weekday?: Weekday;
    startTime?: string;
    endTime?: string;
    source?: StandlSchedule["source"];
    status?: StandlSchedule["status"];
    createdBy?: string;
};

function mapFirestoreStandlSchedule(
    scheduleId: string,
    standlId: string,
    locationId: string,
    data: FirestoreStandlSchedule
): StandlSchedule {
    return {
        id: scheduleId,
        standlId,
        locationId,
        weekday: data.weekday ?? 1,
        startTime: data.startTime ?? "",
        endTime: data.endTime ?? "",
        source: data.source ?? "community",
        status: data.status ?? "pending",
        createdBy: data.createdBy ?? "",
    };
}

export async function createStandlSchedule(
    input: CreateStandlScheduleInput
) {
    const schedulesRef = collection(
        firestoreDb,
        "standl",
        input.standlId,
        "locations",
        input.locationId,
        "schedules"
    );

    const scheduleData = {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        source: input.source,
        status: input.status,
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const createdSchedule = await addDoc(
        schedulesRef,
        scheduleData
    );

    const standlRef = doc(
        firestoreDb,
        "standl",
        input.standlId
    );

    await updateDoc(standlRef, {
        updatedAt: serverTimestamp(),
    });

    return createdSchedule.id;
}

export async function getStandlLocationSchedules(
    standlId: string,
    locationId: string
): Promise<StandlSchedule[]> {
    const schedulesRef = collection(
        firestoreDb,
        "standl",
        standlId,
        "locations",
        locationId,
        "schedules"
    );

    const snapshot = await getDocs(schedulesRef);

    return snapshot.docs.map((scheduleDoc) =>
        mapFirestoreStandlSchedule(
            scheduleDoc.id,
            standlId,
            locationId,
            scheduleDoc.data() as FirestoreStandlSchedule
        )
    );
}

export async function getAllStandlSchedules(): Promise<StandlSchedule[]> {
    const schedulesRef = collectionGroup(firestoreDb, "schedules");
    const snapshot = await getDocs(schedulesRef);

    return snapshot.docs.map((scheduleDoc) => {
        const locationRef = scheduleDoc.ref.parent.parent;
        const standlRef = locationRef?.parent.parent;

        if (
            !locationRef ||
            !standlRef ||
            locationRef.parent.id !== "locations" ||
            standlRef.parent.id !== "standl"
        ) {
            throw new Error(
                `Standzeit ${scheduleDoc.id} liegt nicht unter einem Standl-Standort.`
            );
        }

        return mapFirestoreStandlSchedule(
            scheduleDoc.id,
            standlRef.id,
            locationRef.id,
            scheduleDoc.data() as FirestoreStandlSchedule
        );
    });
}

export async function replaceStandlLocationSchedules(
    input: ReplaceStandlSchedulesInput
) {
    const schedulesRef = collection(
        firestoreDb,
        "standl",
        input.standlId,
        "locations",
        input.locationId,
        "schedules"
    );

    const existingSchedules = await getDocs(schedulesRef);
    const batch = writeBatch(firestoreDb);

    existingSchedules.docs.forEach((scheduleDoc) => {
        batch.delete(scheduleDoc.ref);
    });

    input.schedules.forEach((schedule) => {
        const scheduleRef = doc(schedulesRef);

        batch.set(scheduleRef, {
            weekday: schedule.weekday,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            source: input.source,
            status: input.status,
            createdBy: input.createdBy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    const standlRef = doc(
        firestoreDb,
        "standl",
        input.standlId
    );

    batch.update(standlRef, {
        updatedAt: serverTimestamp(),
    });
    await batch.commit();
}
