import {
    writeBatch,
    updateDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    GeoPoint,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    where,
    query,
} from "firebase/firestore";

import { firestoreDb } from "@/lib/firebase";
import type { Standl } from "@/types/standl";
import { getStandlLocations } from "@/lib/standlLocationService";

type FirestoreOpeningStatus = {
    type: Standl["openingStatus"]["type"];
    label: string;
    source: Standl["openingStatus"]["source"];
};

type FirestoreStandl = {
    id?: string;
    name?: string;
    category?: Standl["category"];
    locationName?: string;
    street?: string;
    streetNumber?: string;
    postalCode?: string;
    city?: string;
    location?: GeoPoint;
    openingStatus?: FirestoreOpeningStatus;
    likes?: number;
    isClaimed?: boolean;
    ownerId?: string | null;
    createdBy?: string;
    claimedAt?: unknown;
    claimedBy?: string;
    source?: "owner" | "community";
};

export function mapFirestoreStandl(documentId: string, data: FirestoreStandl): Standl {
    if (!data.location) {
        throw new Error(`Standl ${documentId} hat keinen GeoPoint.`);
    }

    return {
        id: documentId,
        name: data.name ?? "Unbenanntes Standl",
        category: data.category ?? "hendl",
        locationName: data.locationName ?? "Unbekannter Standort",
        street: data.street ?? "",
        streetNumber: data.streetNumber ?? "",
        postalCode: data.postalCode ?? "",
        city: data.city ?? "",
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        openingStatus: data.openingStatus ?? {
            type: "unknown",
            label: "Keine Standzeit bekannt",
            source: "unknown",
        },
        likes: data.likes ?? 0,
        isClaimed: data.isClaimed ?? false,
        ownerId: data.ownerId ?? undefined,
    };
}

async function mapStandlWithLocations(
    documentId: string,
    data: FirestoreStandl
): Promise<Standl> {
    const standl = mapFirestoreStandl(documentId, data);
    const locations = await getStandlLocations(documentId);

    return {
        ...standl,
        locations,
    };
}

export async function getStandlFromFirestore() {
    const standlRef = collection(firestoreDb, "standl");
    const snapshot = await getDocs(standlRef);

    return Promise.all(
        snapshot.docs.map((standlDoc) =>
            mapStandlWithLocations(
                standlDoc.id,
                standlDoc.data() as FirestoreStandl
            )
        )
    );
}

export function subscribeToStandlFromFirestore(
    onStandlChange: (standl: Standl[]) => void,
    onError: (error: unknown) => void
) {
    const standlRef = collection(firestoreDb, "standl");
    let requestVersion = 0;

    const unsubscribe = onSnapshot(
        standlRef,
        (snapshot) => {
            const currentVersion = ++requestVersion;

            void Promise.all(
                snapshot.docs.map((standlDoc) =>
                    mapStandlWithLocations(
                        standlDoc.id,
                        standlDoc.data() as FirestoreStandl
                    )
                )
            )
                .then((standl) => {
                    if (currentVersion === requestVersion) {
                        onStandlChange(standl);
                    }
                })
                .catch((error: unknown) => {
                    if (currentVersion === requestVersion) {
                        onError(error);
                    }
                });
        },
        onError
    );

    return () => {
        requestVersion += 1;
        unsubscribe();
    };
}

export async function getSingleStandlFromFirestore(standlId: string) {
    const standlRef = doc(firestoreDb, "standl", standlId);
    const snapshot = await getDoc(standlRef);

    if (!snapshot.exists()) {
        return null;
    }

    const standl = mapFirestoreStandl(
        snapshot.id,
        snapshot.data() as FirestoreStandl
    );

    const locations = await getStandlLocations(standlId);

    return {
        ...standl,
        locations,
    };
}

export async function getOwnerStandlFromFirestore(ownerId: string) {
    const standlRef = collection(firestoreDb, "standl");
    const ownerStandlQuery = query(standlRef, where("ownerId", "==", ownerId));
    const snapshot = await getDocs(ownerStandlQuery);

    return snapshot.docs.map((standlDoc) =>
        mapFirestoreStandl(standlDoc.id, standlDoc.data() as FirestoreStandl)
    );
}

export async function hasUserLikedStandl(standlId: string, userId: string) {
    const likeRef = doc(firestoreDb, "standl", standlId, "likes", userId);
    const likeSnapshot = await getDoc(likeRef);

    return likeSnapshot.exists();
}

export async function toggleStandlLike(standlId: string, userId: string) {
    const standlRef = doc(firestoreDb, "standl", standlId);
    const likeRef = doc(firestoreDb, "standl", standlId, "likes", userId);

    return runTransaction(firestoreDb, async (transaction) => {
        const standlSnapshot = await transaction.get(standlRef);
        const likeSnapshot = await transaction.get(likeRef);

        if (!standlSnapshot.exists()) {
            throw new Error("Standl existiert nicht.");
        }

        const currentLikes = standlSnapshot.data().likes ?? 0;

        if (likeSnapshot.exists()) {
            const nextLikes = Math.max(currentLikes - 1, 0);

            transaction.delete(likeRef);
            transaction.update(standlRef, {
                likes: nextLikes,
                updatedAt: serverTimestamp(),
            });

            return {
                liked: false,
                likes: nextLikes,
            };
        }

        const nextLikes = currentLikes + 1;

        transaction.set(likeRef, {
            userId,
            createdAt: serverTimestamp(),
        });

        transaction.update(standlRef, {
            likes: nextLikes,
            updatedAt: serverTimestamp(),
        });

        return {
            liked: true,
            likes: nextLikes,
        };
    });
}



type StandlEditableFields = {
    name: string;
    category: Standl["category"];
    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
};

type CreateStandlInput = StandlEditableFields & {
    createdBy: string;
    mode: "owner" | "community";
};

export async function createStandlInFirestore(input: CreateStandlInput) {
    const standlCollectionRef = collection(firestoreDb, "standl");
    const standlRef = doc(standlCollectionRef);

    const locationCollectionRef = collection(
        standlRef,
        "locations"
    );

    const locationRef = doc(locationCollectionRef);

    const isOwnerCreated = input.mode === "owner";

    const newStandl = {
        name: input.name,
        category: input.category,
        locationName: input.locationName,
        street: input.street ?? "",
        streetNumber: input.streetNumber ?? "",
        postalCode: input.postalCode,
        city: input.city,
        location: new GeoPoint(input.latitude, input.longitude),
        openingStatus: {
            type: "unknown",
            label: "Keine Standzeit bekannt",
            source: isOwnerCreated ? "owner" : "community",
        },
        likes: 0,
        isClaimed: isOwnerCreated,
        ownerId: isOwnerCreated ? input.createdBy : null,
        createdBy: input.createdBy,
        source: isOwnerCreated ? "owner" : "community",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const initialLocation = {
        locationName: input.locationName,
        street: input.street,
        streetNumber: input.streetNumber,
        postalCode: input.postalCode,
        city: input.city,
        location: new GeoPoint(
            input.latitude,
            input.longitude
        ),
        source: isOwnerCreated ? "owner" : "community",
        status: isOwnerCreated ? "verified" : "pending",
        createdBy: input.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const batch = writeBatch(firestoreDb);

    batch.set(standlRef, newStandl);
    batch.set(locationRef, initialLocation);

    await batch.commit();

    return standlRef.id;
}

export async function claimStandlInFirestore(
    standlId: string,
    ownerId: string
) {
    const standlRef = doc(firestoreDb, "standl", standlId);

    return runTransaction(firestoreDb, async (transaction) => {
        const standlSnapshot = await transaction.get(standlRef);

        if (!standlSnapshot.exists()) {
            throw new Error("Standl existiert nicht.");
        }

        const currentStandl = standlSnapshot.data();

        if (currentStandl.isClaimed === true) {
            throw new Error("Dieses Standl wurde bereits übernommen.");
        }

        transaction.update(standlRef, {
            isClaimed: true,
            ownerId,
            claimedAt: serverTimestamp(),
            claimedBy: ownerId,
            updatedAt: serverTimestamp(),
        });

        return {
            isClaimed: true,
            ownerId,
        };
    });
}



export async function updateOwnerStandlInFirestore(
    standlId: string,
    ownerId: string,
    input: StandlEditableFields
) {
    const standlRef = doc(firestoreDb, "standl", standlId);
    const standlSnapshot = await getDoc(standlRef);

    if (!standlSnapshot.exists()) {
        throw new Error("Standl existiert nicht.");
    }

    const currentStandl = standlSnapshot.data();

    if (currentStandl.ownerId !== ownerId) {
        throw new Error(
            "Dieses Standl gehört nicht zum eingeloggten Besitzerkonto."
        );
    }

    await updateDoc(standlRef, {
        name: input.name,
        category: input.category,
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
}

type UpdateStandlBaseInfoInput = {
    name: string;
    category: Standl["category"];
};

export async function updateOwnerStandlBaseInfoInFirestore(
    standlId: string,
    ownerId: string,
    input: UpdateStandlBaseInfoInput
) {
    const standlRef = doc(firestoreDb, "standl", standlId);
    const standlSnapshot = await getDoc(standlRef);

    if (!standlSnapshot.exists()) {
        throw new Error("Standl existiert nicht.");
    }

    const currentStandl = standlSnapshot.data();

    if (!currentStandl.isClaimed || currentStandl.ownerId !== ownerId) {
        throw new Error(
            "Dieses Standl gehört nicht zum eingeloggten Besitzerkonto."
        );
    }

    await updateDoc(standlRef, {
        name: input.name,
        category: input.category,
        updatedAt: serverTimestamp(),
    });
}
