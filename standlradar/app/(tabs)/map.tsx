import { StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Karte</Text>
            <Text style={styles.text}>Hier kommt später die Google Map hin.</Text>
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