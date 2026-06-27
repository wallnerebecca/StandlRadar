import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    writeBatch,
} from "firebase/firestore";

import { firestoreDb } from "@/lib/firebase";

export async function getUserFavoriteStandlIds(userId: string) {
    const favoritesRef = collection(firestoreDb, "users", userId, "favorites");
    const snapshot = await getDocs(favoritesRef);

    return snapshot.docs.map((favoriteDoc) => favoriteDoc.id);
}

export async function addUserFavoriteStandl(userId: string, standlId: string) {
    const favoriteRef = doc(
        firestoreDb,
        "users",
        userId,
        "favorites",
        standlId
    );

    await setDoc(favoriteRef, {
        standlId,
        createdAt: serverTimestamp(),
    });
}

export async function removeUserFavoriteStandl(
    userId: string,
    standlId: string
) {
    const favoriteRef = doc(
        firestoreDb,
        "users",
        userId,
        "favorites",
        standlId
    );

    await deleteDoc(favoriteRef);
}

export async function saveUserFavoriteStandlIds(
    userId: string,
    standlIds: string[]
) {
    const batch = writeBatch(firestoreDb);

    standlIds.forEach((standlId) => {
        const favoriteRef = doc(
            firestoreDb,
            "users",
            userId,
            "favorites",
            standlId
        );

        batch.set(favoriteRef, {
            standlId,
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
}