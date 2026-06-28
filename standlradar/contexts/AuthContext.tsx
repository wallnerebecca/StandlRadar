import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "firebase/auth";
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    createUserProfile,
    getUserProfile
} from "@/lib/userProfileService";

import type {
    UserRole,
    UserProfile
} from "@/types/user";
import { firebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    userProfile: UserProfile | null;
    isProfileLoading: boolean;
    refreshUserProfile: () => Promise<void>;
    registerWithEmail: (
        email: string,
        password: string,
        username: string,
        role?: UserRole
    ) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [userProfile, setUserProfile] =
        useState<UserProfile | null>(null);

    const [isProfileLoading, setIsProfileLoading] =
        useState(false);

    const loadUserProfile = useCallback(async (uid: string) => {
        setIsProfileLoading(true);

        try {
            const profile = await getUserProfile(uid);
            setUserProfile(profile);
        } catch (error) {
            console.warn("Userprofil konnte nicht geladen werden:", error);
            setUserProfile(null);
        } finally {
            setIsProfileLoading(false);
        }
    }, []);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setUserProfile(null);
                setIsProfileLoading(false);
            } else {
                setIsProfileLoading(true);
            }

            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        loadUserProfile(user.uid);
    }, [user, loadUserProfile]);

    const refreshUserProfile = useCallback(async () => {
        if (!user) {
            setUserProfile(null);
            return;
        }

        await loadUserProfile(user.uid);
    }, [user, loadUserProfile]);

    async function registerWithEmail(email: string, password: string,
        username: string,
        role: UserRole = "user"
    ) {
        const userCredential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password
        );
        await createUserProfile(userCredential.user, username, role);
        await loadUserProfile(userCredential.user.uid);
    }

    async function loginWithEmail(email: string, password: string) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(firebaseAuth, email);
    }

    async function logout() {
        await signOut(firebaseAuth);
    }

    const value = useMemo(
        () => ({
            user,
            isLoading,
            userProfile,
            isProfileLoading,
            refreshUserProfile,
            registerWithEmail,
            loginWithEmail,
            resetPassword,
            logout,
        }),
        [
            user,
            isLoading,
            userProfile,
            isProfileLoading,
            refreshUserProfile,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}