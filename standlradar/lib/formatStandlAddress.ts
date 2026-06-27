import type { Standl } from "@/types/standl";

export function formatStreetAddress(standl: Standl) {
    return [standl.street, standl.streetNumber]
        .filter(Boolean)
        .join(" ");
}

export function formatFullAddress(standl: Standl) {
    const streetAddress = formatStreetAddress(standl);

    const cityAddress = [standl.postalCode, standl.city]
        .filter(Boolean)
        .join(" ");

    return [streetAddress, cityAddress]
        .filter(Boolean)
        .join(", ");
}