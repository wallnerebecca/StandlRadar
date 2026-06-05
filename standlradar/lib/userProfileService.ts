import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

import { firestoreDb } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types/user";

export async function createUserProfile(
    user: User,
    username: string,
    role: UserRole = "user"
) {
    const userRef = doc(firestoreDb, "users", user.uid);

    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
        return;
    }

    const userProfile = {
        uid: user.uid,
        email: user.email ?? "",
        username,
        role,
        wasOwner: role === "owner",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userProfile);
}

export async function getUserProfile(uid: string) {
    const userRef = doc(firestoreDb, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        return null;
    }

    return userSnapshot.data() as UserProfile;
}