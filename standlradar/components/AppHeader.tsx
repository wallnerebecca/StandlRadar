import { StyleSheet, Text, View } from "react-native";
import { Theme } from "@/constants/colors";

type AppHeaderProps = {
    title: string;
    subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 32,
        fontWeight: "700",
    },
    subtitle: {
        color: Theme.textSecondary,
        fontSize: 16,
        marginTop: 6,
        lineHeight: 22,
    },
});