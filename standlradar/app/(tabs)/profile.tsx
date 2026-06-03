import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.text}>Login und Mein-Standl-Bereich kommen hier hin.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#181412",
        padding: 24,
        justifyContent: "center",
    },
    title: {
        color: "#FFF4E4",
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
    },
    text: {
        color: "#CDBBA4",
        fontSize: 16,
    },
});