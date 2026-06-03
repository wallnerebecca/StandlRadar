import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { Theme } from "@/constants/colors";

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <AppHeader
                title="Karte"
                subtitle="Hier kommt später die Google Map mit Standl-Markern hin."
            />

            <Text style={styles.placeholder}>🗺️ Map-Platzhalter</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.background,
        padding: 24,
        paddingTop: 64,
    },
    placeholder: {
        color: Theme.textSecondary,
        fontSize: 18,
    },
});