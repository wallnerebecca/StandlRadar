import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
    const { registerWithEmail } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleRegister() {
        setErrorMessage("");

        if (password !== passwordRepeat) {
            setErrorMessage("Die Passwörter stimmen nicht überein.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Das Passwort muss mindestens 6 Zeichen haben.");
            return;
        }

        setIsSubmitting(true);

        try {
            await registerWithEmail(email.trim(), password);
            router.replace("/(tabs)/profile");
        } catch (error) {
            console.warn(error);
            setErrorMessage("Registrierung fehlgeschlagen. Prüfe deine Eingaben.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Registrieren</Text>
                <Text style={styles.subtitle}>
                    Erstelle ein Konto, um später Favoriten zu synchronisieren und Standl
                    zu liken.
                </Text>

                <View style={styles.form}>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="E-Mail"
                        placeholderTextColor={Theme.textSecondary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />

                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Passwort"
                        placeholderTextColor={Theme.textSecondary}
                        secureTextEntry
                        style={styles.input}
                    />

                    <TextInput
                        value={passwordRepeat}
                        onChangeText={setPasswordRepeat}
                        placeholder="Passwort wiederholen"
                        placeholderTextColor={Theme.textSecondary}
                        secureTextEntry
                        style={styles.input}
                    />

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    <PrimaryButton
                        label={isSubmitting ? "Registrieren..." : "Registrieren"}
                        onPress={handleRegister}
                        disabled={isSubmitting}
                    />

                    <SecondaryButton
                        label="Zum Login"
                        onPress={() => router.push("/auth/login")}
                    />

                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.backText}>Zurück</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 80,
    },
    title: {
        color: Theme.textPrimary,
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 8,
    },
    subtitle: {
        color: Theme.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 28,
    },
    form: {
        gap: 12,
    },
    input: {
        backgroundColor: Theme.card,
        borderColor: Theme.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        color: Theme.textPrimary,
        fontSize: 16,
    },
    errorText: {
        color: Theme.error,
        fontSize: 14,
        lineHeight: 20,
    },
    backText: {
        color: Theme.textSecondary,
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 6,
    },
});