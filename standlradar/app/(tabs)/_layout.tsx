import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            initialRouteName="radar"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#C75A1B",
                tabBarInactiveTintColor: "#CDBBA4",
                tabBarStyle: {
                    backgroundColor: "#231D1A",
                    borderTopColor: "#4A3B34",
                },
            }}
        >
            <Tabs.Screen
                name="map"
                options={{
                    title: "Karte",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="radar"
                options={{
                    title: "Radar",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="radio-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}