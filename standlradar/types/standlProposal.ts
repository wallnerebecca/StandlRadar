import type { Weekday } from "@/types/standlSchedule";

export type ProposalStatus =
    | "pending"
    | "verified"
    | "rejected";

export type ProposalVote = "confirm" | "reject";

export type StandlScheduleProposal = {
    id: string;
    standlId: string;
    locationId: string;

    weekday: Weekday;
    startTime: string;
    endTime: string;

    proposedBy: string;
    status: ProposalStatus;

    confirmations: number;
    rejections: number;
};

export type StandlLocationProposal = {
    id: string;
    standlId: string;

    locationName: string;
    street: string;
    streetNumber: string;
    postalCode: string;
    city: string;

    latitude: number;
    longitude: number;

    proposedBy: string;
    status: ProposalStatus;

    confirmations: number;
    rejections: number;
};