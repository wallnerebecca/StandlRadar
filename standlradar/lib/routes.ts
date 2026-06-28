export const routes = {
    login: "/auth/login",
    radar: "/(tabs)/radar",
    owner: "/owner",
    profile: "/(tabs)/profile",

    newOwnerStandl: "/standl/new?mode=owner",
    newCommunityStandl: "/standl/new?mode=community",

    newStandlLocation: (standlId: string) =>
        `/standl/${standlId}/location/new` as const,

    editStandlLocation: (standlId: string, locationId: string) =>
        `/standl/${standlId}/location/${locationId}/edit` as const,

    newStandlSchedule: (
        standlId: string,
        locationId: string
    ) =>
        `/standl/${standlId}/location/${locationId}/schedule/new` as const,

    standlDetail: (standlId: string) =>
        `/standl/${standlId}` as const,

    standlEdit: (standlId: string) =>
        `/standl/edit/${standlId}` as const,
} as const;