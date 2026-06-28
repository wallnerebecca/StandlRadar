import type { PropsWithChildren } from "react";

import { useCanEditStandl } from "@/hooks/useCanEditStandl";
import type { Standl } from "@/types/standl";

type OwnerStandlOptionProps = PropsWithChildren<{
    standl: Standl | null;
}>;

export function OwnerStandlOption({
    standl,
    children,
}: OwnerStandlOptionProps) {
    const canEditStandl = useCanEditStandl(standl);

    if (!canEditStandl) {
        return null;
    }

    return <>{children}</>;
}