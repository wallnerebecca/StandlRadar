import {
    collection,
    doc,
    getDoc,
    getDocs,
    GeoPoint,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import { firestoreDb } from "@/lib/firebase";
import type { Standl } from "@/types/standl";

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
    postalCode?: string;
    city?: string;
    location?: GeoPoint;
    openingStatus?: FirestoreOpeningStatus;
    likes?: number;
    isClaimed?: boolean;
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
    };
}

export async function getStandlFromFirestore() {
    const standlRef = collection(firestoreDb, "standl");
    const snapshot = await getDocs(standlRef);

    return snapshot.docs.map((standlDoc) =>
        mapFirestoreStandl(standlDoc.id, standlDoc.data() as FirestoreStandl)
    );
}

export async function getSingleStandlFromFirestore(standlId: string) {
    const standlRef = doc(firestoreDb, "standl", standlId);
    const snapshot = await getDoc(standlRef);

    if (!snapshot.exists()) {
        return null;
    }

    return mapFirestoreStandl(snapshot.id, snapshot.data() as FirestoreStandl);
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