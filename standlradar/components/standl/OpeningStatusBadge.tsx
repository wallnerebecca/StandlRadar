import { StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/colors";
import type { OpeningStatusType } from "@/types/standl";

type OpeningStatusBadgeProps = {
    type: OpeningStatusType;
    label: string;
    source: "owner" | "community" | "unknown";
};

export function OpeningStatusBadge({
    type,
    label,
    source,
}: OpeningStatusBadgeProps) {
    const sourceLabel =
        source === "owner"
            ? "Von Besitzer*in bestätigt"
            : source === "community"
                ? "Von Community vorgeschlagen"
                : "Keine Quelle bekannt";

    return (
        <View style={[styles.badge, getBadgeStyle(type)]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.source}>{sourceLabel}</Text>
        </View>
    );
}

function getBadgeStyle(type: OpeningStatusType) {
    if (type === "open") return styles.open;
    if (type === "likelyOpen") return styles.warning;
    if (type === "opensLater") return styles.warning;
    if (type === "temporaryClosed") return styles.closed;
    if (type === "closed") return styles.closed;
    return styles.unknown;
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
    },
    open: {
        backgroundColor: "rgba(95, 158, 110, 0.16)",
        borderColor: Theme.success,
    },
    warning: {
        backgroundColor: "rgba(217, 164, 65, 0.16)",
        borderColor: Theme.warning,
    },
    closed: {
        backgroundColor: "rgba(217, 83, 79, 0.16)",
        borderColor: Theme.error,
    },
    unknown: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
    },
    label: {
        color: Theme.textPrimary,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 4,
    },
    source: {
        color: Theme.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
});