import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type ColorValue } from "react-native";

import AppHeader from "@/components/navigation/AppHeader";
import { colors } from "@/constants/colors";
import { fonts, seniorTypography } from "@/constants/typography";

type AssistantTabIconProps = {
  color: ColorValue;
  focused: boolean;
};

function AssistantTabIcon({ color, focused }: AssistantTabIconProps) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 14,
      stiffness: 180,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  return (
    <Animated.View
      style={[
        styles.assistantIcon,
        focused && styles.assistantIconFocused,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.82, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.76, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons
        name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
        size={27}
        color={color}
      />
    </Animated.View>
  );
}

export default function SeniorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#B0B8C1",

        tabBarStyle: {
          height: 86,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: "#FFFFFF",

          borderTopWidth: 1,
          borderTopColor: "#F2F4F6",

          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarLabelStyle: {
          fontSize: seniorTypography.tabLabel,
          fontFamily: fonts.semiBold,
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",

          headerShown: true,
          header: () => <AppHeader mode="senior" />,

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI 비서",

          headerShown: false,

          tabBarIcon: ({ color, focused }) => (
            <AssistantTabIcon color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "활동",

          headerShown: true,
          header: () => <AppHeader mode="senior" />,

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "walk" : "walk-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  assistantIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "transparent",
  },
  assistantIconFocused: {
    backgroundColor: "#E8F4EF",
  },
});
