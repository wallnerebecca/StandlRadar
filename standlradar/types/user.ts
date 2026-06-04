export type UserRole = "user" | "owner" | "admin";

export type UserProfile = {
    uid: string;
    email: string;
    username: string;
    role: UserRole;
    wasOwner: boolean;
    createdAt: unknown;
    updatedAt: unknown;
};