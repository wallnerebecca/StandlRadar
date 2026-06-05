import type { PropsWithChildren, ReactNode } from "react";
import {
    ScrollView,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/colors";

type ScreenContainerProps = PropsWithChildren<{
    contentStyle?: StyleProp<ViewStyle>;
    floatingContent?: ReactNode;
}>;

export function ScreenContainer({
    children,
    contentStyle,
    floatingContent,
}: ScreenContainerProps) {
    return (
        <SafeAreaView
            style={styles.safeArea}
            edges={["top", "bottom"]}
        >
            <View style={styles.screen}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.content,
                        contentStyle,
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>

                {floatingContent}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    screen: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
});