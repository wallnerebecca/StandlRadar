import {
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { firebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    registerWithEmail: (email: string, password: string) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    async function registerWithEmail(email: string, password: string) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
    }

    async function loginWithEmail(email: string, password: string) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
    }

    async function logout() {
        await signOut(firebaseAuth);
    }

    const value = useMemo(
        () => ({
            user,
            isLoading,
            registerWithEmail,
            loginWithEmail,
            logout,
        }),
        [user, isLoading]
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