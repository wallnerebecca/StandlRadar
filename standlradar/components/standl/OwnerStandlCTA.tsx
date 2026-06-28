import { router } from "expo-router";

import { RadarStartCTA } from "@/components/buttons/RadarStartCTA";
import { routes } from "@/lib/routes";
import type { UserRole } from "@/types/user";

type OwnerStandlCTAProps = {
    role?: UserRole;
};

export function OwnerStandlCTA({
    role,
}: OwnerStandlCTAProps) {
    if (role !== "owner") {
        return null;
    }

    return (
        <RadarStartCTA
            title="Zu meine Standln"
            description="Verwalte Zeiten zu deinen Standl."
            icon="storefront-outline"
            onPress={() => {
                router.push(routes.owner);
            }}
        />
    );
}