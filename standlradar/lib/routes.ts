export const routes = {
    login: "/auth/login",
    radar: "/(tabs)/radar",
    owner: "/owner",
    profile: "/(tabs)/profile",

    newOwnerStandl: "/standl/new?mode=owner",
    newCommunityStandl: "/standl/new?mode=community",

    standlDetail: (standlId: string) =>
        `/standl/${standlId}` as const,

    standlEdit: (standlId: string) =>
        `/standl/edit/${standlId}` as const,
} as const;