type AddressFields = {
    street?: string;
    streetNumber?: string;
    postalCode: string;
    city: string;
};

export function formatStreetAddress(address: AddressFields) {
    return [address.street, address.streetNumber]
        .filter(Boolean)
        .join(" ");
}

export function formatFullAddress(address: AddressFields) {
    const streetAddress = formatStreetAddress(address);

    const cityAddress = [address.postalCode, address.city]
        .filter(Boolean)
        .join(" ");

    return [streetAddress, cityAddress]
        .filter(Boolean)
        .join(", ");
}