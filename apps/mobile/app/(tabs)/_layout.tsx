import { Tabs } from "expo-router";
import { YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "../../src/kit";
import { palette as c } from "../../src/theme";
const screens: {
  name: string;
  title: string;
  accessibility: string;
  icon: IconName;
  active: IconName;
}[] = [
  {
    name: "index",
    title: "ホーム",
    accessibility: "Today",
    icon: "home-outline",
    active: "home",
  },
  {
    name: "journey",
    title: "ぼうけん",
    accessibility: "Journey",
    icon: "map-outline",
    active: "map",
  },
  {
    name: "review",
    title: "ことば",
    accessibility: "Review",
    icon: "albums-outline",
    active: "albums",
  },
  {
    name: "journal",
    title: "思い出",
    accessibility: "Journal",
    icon: "chatbubbles-outline",
    active: "chatbubbles",
  },
  {
    name: "settings",
    title: "設定",
    accessibility: "Settings",
    icon: "settings-outline",
    active: "settings",
  },
];
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.green,
        tabBarInactiveTintColor: c.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: c.white,
          borderTopColor: c.line,
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
      }}
    >
      {screens.map((s) => (
        <Tabs.Screen
          key={s.name}
          name={s.name}
          options={{
            title: s.title,
            tabBarAccessibilityLabel: s.accessibility,
            tabBarIcon: ({ color, focused }) => (
              <YStack
                width={48}
                height={31}
                borderRadius={12}
                justifyContent="center"
                alignItems="center"
                backgroundColor={focused ? c.pale : "transparent"}
              >
                <Icon
                  name={focused ? s.active : s.icon}
                  color={color}
                  size={22}
                />
              </YStack>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
