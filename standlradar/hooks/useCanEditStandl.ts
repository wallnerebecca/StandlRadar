import { useAuth } from "@/contexts/AuthContext";
import type { Standl } from "@/types/standl";

export function useCanEditStandl(standl: Standl | null) {
    const { user } = useAuth();

    return (
        !!user &&
        !!standl &&
        standl.isClaimed &&
        standl.ownerId === user.uid
    );
}