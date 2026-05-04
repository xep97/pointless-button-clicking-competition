import { Ionicons } from "@expo/vector-icons"; // Built into Expo
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#e74c3c", // Matches your game theme
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#111", // Dark background for the tab bar
          borderTopColor: "#222",
        },
        headerShown: false, // Hides the top header for a cleaner game look
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Play",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Rankings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
