import { Tabs } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      {/* , tabBarActiveBackgroundColor: "magenta" */}
      {/* <FontAwesome5 name="home" size={24} color="black" /> */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          //size adapts the tab screen
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* <Tabs.Screen name="login" options={{ title: "Login" }} /> */}
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          //size adapts the tab screen
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          //size adapts the tab screen
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-habit-ai"
        options={{
          title: "Add Goal",
          //size adapts the tab screen
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
