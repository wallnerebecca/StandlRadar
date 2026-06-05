import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";

type ScreenStateProps = {
    title?: string;
    message: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
};

export function ScreenState({
    title,
    message,
    primaryActionLabel,
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
}: ScreenStateProps) {
    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                {title ? <Text style={styles.title}>{title}</Text> : null}

                <Text style={styles.message}>{message}</Text>

                {primaryActionLabel && onPrimaryAction ? (
                    <PrimaryButton
                        label={primaryActionLabel}
                        onPress={onPrimaryAction}
                    />
                ) : null}

                {secondaryActionLabel && onSecondaryAction ? (
                    <SecondaryButton
                        label={secondaryActionLabel}
                        onPress={onSecondaryAction}
                    />
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
        justifyContent: "center",
        padding: 24,
    },
    content: {
        gap: 16,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 26,
        fontWeight: "800",
    },
    message: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
});