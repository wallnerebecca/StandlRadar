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

import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { Theme } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

import { routes } from "@/lib/routes";

export default function LoginScreen() {
    const { loginWithEmail, resetPassword } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleLogin() {
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            await loginWithEmail(email.trim(), password);
            router.replace(routes.profile);
        } catch (error) {
            console.warn(error);
            setErrorMessage("Login fehlgeschlagen. Prüfe E-Mail und Passwort.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handlePasswordReset() {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setErrorMessage("Bitte gib deine E-Mail-Adresse ein.");
            setSuccessMessage("");
            return;
        }

        try {
            await resetPassword(trimmedEmail);

            setErrorMessage("");
            setSuccessMessage(
                "Wenn ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen gesendet."
            );
        } catch (error) {
            console.warn("Passwort-Zurücksetzen fehlgeschlagen:", error);

            setSuccessMessage("");
            setErrorMessage(
                "Die E-Mail zum Zurücksetzen konnte nicht gesendet werden."
            );
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Einloggen</Text>
                <Text style={styles.subtitle}>
                    Melde dich an, um später Favoriten dauerhaft zu speichern und Standl
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

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    {successMessage ? (
                        <Text style={styles.successText}>
                            {successMessage}
                        </Text>
                    ) : null}

                    <PrimaryButton
                        label={isSubmitting ? "Einloggen..." : "Einloggen"}
                        onPress={handleLogin}
                        disabled={isSubmitting}
                    />

                    <SecondaryButton
                        label="Zur Registrierung"
                        onPress={() => router.push("/auth/register")}
                    />

                    <Pressable onPress={handlePasswordReset}>
                        <Text style={styles.forgptPw}>Passwort vergessen</Text>
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
    forgptPw: {
        color: Theme.textSecondary,
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 6,
    },
    successText: {
        color: Theme.success,
        fontSize: 14,
        lineHeight: 20,
    },
});