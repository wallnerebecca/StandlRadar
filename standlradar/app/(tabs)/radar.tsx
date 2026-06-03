import { StyleSheet, Text, View } from "react-native";

export default function RadarScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>StandlRadar</Text>
            <Text style={styles.subtitle}>Servus, wonach suchst du?</Text>
            <Text style={styles.text}>Radar-Startscreen kommt hier hin.</Text>
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
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        color: "#F3D9B1",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
    },
    text: {
        color: "#CDBBA4",
        fontSize: 16,
    },
});