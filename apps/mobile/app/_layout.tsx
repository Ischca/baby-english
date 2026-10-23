import { useEffect } from "react";
import { Stack, router, usePathname } from "expo-router";
import { TamaguiProvider, YStack, Text } from "tamagui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { connectCoach } from "@shared/api";
import { config, palette as c } from "../src/theme";
import { useLearning } from "../src/store";
import { Action, ErrorNotice } from "../src/kit";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 }, mutations: { retry: false } },
});
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey)
  connectCoach(supabaseUrl, supabaseKey, AsyncStorage);

function AppNavigation() {
  const { ready, progress, hydrate, storageError, loadError, retrySave } =
    useLearning();
  const pathname = usePathname();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (ready && loadError && pathname !== "/settings")
      router.replace("/settings");
    if (
      ready &&
      !loadError &&
      !progress.profile &&
      pathname !== "/onboarding" &&
      pathname !== "/settings"
    )
      router.replace("/onboarding");
  }, [ready, loadError, progress.profile, pathname]);
  if (!ready)
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>Opening your little world…</Text>
      </YStack>
    );
  return (
    <>
      <StatusBar style="dark" />
      {storageError && (
        <YStack padding={12} gap={8}>
          <ErrorNotice text={storageError} />
          <Action
            secondary
            onPress={loadError ? () => void hydrate() : retrySave}
          >
            {loadError ? "再読み込み" : "再保存"}
          </Action>
        </YStack>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.paper },
          animation: "fade",
        }}
      />
    </>
  );
}
export default function RootLayout() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: c.paper }}
            edges={["top", "left", "right"]}
          >
            <AppNavigation />
          </SafeAreaView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
