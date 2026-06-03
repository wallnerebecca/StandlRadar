import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { StandlCard } from "@/components/StandlCard";
import { Theme } from "@/constants/colors";
import { mockStandl } from "@/constants/mockStandl";
import { router } from "expo-router/build/exports";
import { useFavorites } from "@/contexts/FavoritesContext";

export default function MapScreen() {
    const { favoriteStandlIds } = useFavorites();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <AppHeader
                title="Karte"
                subtitle="Hier kommt später die Google Map mit Standl-Markern hin."
            />

            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapIcon}>🗺️</Text>
                <Text style={styles.mapText}>Map-Platzhalter</Text>
                <Text style={styles.mapSubtext}>
                    Später werden hier {mockStandl.length} Standl als Marker angezeigt.
                </Text>
            </View>

            <Text style={styles.sectionTitle}>Standl auf der Karte</Text>

            <View style={styles.cardList}>
                {mockStandl.map((standl) => (
                    <StandlCard
                        key={standl.id}
                        standl={standl}
                        isFavorite={favoriteStandlIds.includes(standl.id)}
                        onPress={() => {
                            router.push(`/standl/${standl.id}`);
                        }}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    content: {
        padding: 24,
        paddingTop: 64,
    },
    mapPlaceholder: {
        backgroundColor: Theme.surface,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 22,
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginBottom: 28,
    },
    mapIcon: {
        fontSize: 42,
        marginBottom: 12,
    },
    mapText: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 6,
    },
    mapSubtext: {
        color: Theme.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    cardList: {
        gap: 12,
        paddingBottom: 32,
    },
});