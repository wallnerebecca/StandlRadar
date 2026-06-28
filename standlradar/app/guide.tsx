import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ScreenState } from "@/components/layout/ScreenState";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

type InfoSectionProps = {
    title: string;
    text: string;
};

function InfoSection({ title, text }: InfoSectionProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardText}>{text}</Text>
        </View>
    );
}

export default function GuideScreen() {
    const {
        user,
        userProfile,
        isLoading,
        isProfileLoading,
    } = useAuth();

    if (isLoading || (user && isProfileLoading)) {
        return <ScreenState message="Informationen werden geladen..." />;
    }

    const isOwner = userProfile?.role === "owner";

    return (
        <ScreenContainer contentStyle={styles.content}>
            <AppHeader
                title="So funktioniert StandlRadar"
                subtitle={
                    isOwner
                        ? "Finde Standl und verwalte deinen eigenen Auftritt."
                        : "Finde schnell das passende Standl in deiner Nähe."
                }
            />

            {!user ? (
                <>
                    <InfoSection
                        title="Was ist StandlRadar?"
                        text="StandlRadar hilft dir, Hendl- und Steckerlfisch-Standl zu entdecken, aktuelle Standorte zu finden und direkt dorthin zu navigieren."
                    />

                    <InfoSection
                        title="Vorteile eines Nutzerkontos"
                        text="Mit einem kostenlosen Konto kannst du Lieblings-Standl dauerhaft speichern und Hendl- oder Fisch-Likes vergeben."
                    />

                    <InfoSection
                        title="Wozu dient ein Owner-Konto?"
                        text="Standl-Besitzer*innen können ihr Standl offiziell verwalten und Standorte sowie Standzeiten aktuell halten."
                    />
                </>
            ) : (
                <>
                    <InfoSection
                        title="Standl entdecken"
                        text="Im Radar findest du Hendl- und Steckerlfisch-Standl. Suche nach Namen oder Orten und filtere nach Kategorie, geöffneten Standln oder deinen Favoriten."
                    />

                    <InfoSection
                        title="Den richtigen Standort finden"
                        text="StandlRadar zeigt dir passende Standorte, aktuelle Standzeiten, Öffnungsstatus und Entfernung. Über die Navigation kommst du direkt zum ausgewählten Standort."
                    />

                    <InfoSection
                        title="Favoriten und Likes"
                        text="Speichere interessante Standl als Favoriten. Mit deinem Hendl- oder Fisch-Like zeigst du anderen, welche Standl besonders beliebt sind."
                    />

                    {isOwner ? (
                        <>
                            <InfoSection
                                title="Deine Rolle als Owner"
                                text="Als Owner nutzt du weiterhin alle normalen Radar-Funktionen. Zusätzlich kannst du eigene Standl erstellen oder ein vorhandenes Standl übernehmen und dadurch offiziell verwalten."
                            />

                            <InfoSection
                                title="Standorte und Standzeiten verwalten"
                                text="Unter „Meine Standl“ bearbeitest du Name und Kategorie, legst mehrere Standorte an und pflegst deren Wochentage und Uhrzeiten. Aktuelle Angaben helfen Nutzer*innen, dein Standl zuverlässig zu finden."
                            />
                        </>
                    ) : (
                        <InfoSection
                            title="Was machen Owner?"
                            text="Owner sind Standl-Besitzer*innen. Sie können ihr Standl offiziell übernehmen und Standorte sowie Standzeiten selbst aktuell halten. Wenn du selbst ein Standl betreibst, kannst du die Owner-Rolle im Profil dauerhaft aktivieren."
                        />
                    )}
                </>
            )}

            <SecondaryButton
                label="Zurück zum Profil"
                onPress={() => router.back()}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
        gap: 12,
    },
    card: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        gap: 7,
    },
    cardTitle: {
        color: Theme.textPrimary,
        fontSize: 17,
        fontWeight: "800",
    },
    cardText: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
});
