import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { FilterChip } from "@/components/FilterChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { StandlCard } from "@/components/StandlCard";
import { Theme } from "@/constants/colors";

export default function RadarScreen() {
    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <AppHeader
                title="StandlRadar"
                subtitle="Servus, wonach suchst du?"
            />

            <View style={styles.buttonGroup}>
                <PrimaryButton
                    label="Standl in der Nähe finden"
                    onPress={() => {
                        router.push("/(tabs)/map");
                    }}
                />

                <SecondaryButton
                    label="Favoriten anzeigen"
                    onPress={() => {
                        console.log("Favoriten anzeigen");
                    }}
                />

                <SecondaryButton
                    label="PLZ eingeben"
                    onPress={() => {
                        console.log("PLZ eingeben");
                    }}
                />
            </View>

            <Text style={styles.sectionTitle}>Schnell filtern</Text>

            <View style={styles.chipRow}>
                <FilterChip label="Alle" selected onPress={() => { }} />
                <FilterChip label="Hendl" onPress={() => { }} />
                <FilterChip label="Steckerlfisch" onPress={() => { }} />
                <FilterChip label="Jetzt geöffnet" onPress={() => { }} />
            </View>

            <Text style={styles.sectionTitle}>Standl in deiner Nähe</Text>

            <View style={styles.cardList}>
                <StandlCard
                    name="Hendl Maxl"
                    category="hendl"
                    location="Linz"
                    status="Heute geöffnet"
                    likes={24}
                    onPress={() => {
                        console.log("Hendl Maxl öffnen");
                    }}
                />

                <StandlCard
                    name="Fischstandl Donau"
                    category="steckerlfisch"
                    location="Ottensheim"
                    status="Heute vermutlich da"
                    likes={18}
                    onPress={() => {
                        console.log("Fischstandl Donau öffnen");
                    }}
                />
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
    buttonGroup: {
        gap: 12,
        marginBottom: 28,
    },
    sectionTitle: {
        color: Theme.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 28,
    },
    cardList: {
        gap: 12,
        paddingBottom: 32,
    },
});