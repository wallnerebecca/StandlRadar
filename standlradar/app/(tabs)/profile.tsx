import { StyleSheet, Text, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Theme } from "@/constants/colors";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <AppHeader
                title="Profil"
                subtitle="Login, Einstellungen und Mein-Standl-Bereich kommen hier hin."
            />

            <PrimaryButton
                label="Einloggen"
                onPress={() => {
                    console.log("Einloggen");
                }}
            />

            <Text style={styles.hint}>
                Mit Login kannst du Favoriten dauerhaft speichern und Standl liken.
            </Text>
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
    hint: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginTop: 18,
    },
});