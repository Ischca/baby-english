import type { ComponentProps, PropsWithChildren } from "react";
import { Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button, Text, XStack, YStack, Input } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { palette as c } from "./theme";

export function Icon({
  name,
  size = 21,
  color = c.ink,
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Body({
  children,
  muted = false,
  small = false,
}: PropsWithChildren<{ muted?: boolean; small?: boolean }>) {
  return (
    <Text
      color={muted ? c.muted : c.ink}
      fontSize={small ? 13 : 16}
      lineHeight={small ? 21 : 26}
    >
      {children}
    </Text>
  );
}
export function Title({
  children,
  small = false,
}: PropsWithChildren<{ small?: boolean }>) {
  return (
    <Text
      color={c.ink}
      fontSize={small ? 25 : 38}
      lineHeight={small ? 34 : 46}
      fontWeight="600"
      style={Platform.OS === "web" ? { fontFamily: "Georgia, serif" } : {}}
    >
      {children}
    </Text>
  );
}
export function Label({ children }: PropsWithChildren) {
  return (
    <Text color={c.muted} fontSize={11} fontWeight="700" letterSpacing={2}>
      {children}
    </Text>
  );
}
export function Action({
  children,
  onPress,
  secondary = false,
  disabled = false,
  testID,
  icon,
}: PropsWithChildren<{
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
}>) {
  return (
    <Button
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      opacity={disabled ? 0.45 : 1}
      minHeight={50}
      height="auto"
      paddingVertical={13}
      paddingHorizontal={20}
      borderRadius={15}
      backgroundColor={secondary ? c.white : c.green}
      borderWidth={secondary ? 1 : 0}
      borderColor={c.line}
      color={secondary ? c.ink : c.white}
      fontSize={15}
      fontWeight="600"
      pressStyle={{ opacity: 0.8 }}
      {...(icon
        ? {
            icon: (
              <Icon name={icon} color={secondary ? c.ink : c.white} size={18} />
            ),
          }
        : {})}
    >
      {children}
    </Button>
  );
}
export function Panel({
  children,
  tone = "white",
}: PropsWithChildren<{ tone?: "white" | "green" | "blue" }>) {
  return (
    <YStack
      padding={23}
      gap={16}
      borderRadius={24}
      backgroundColor={
        tone === "green" ? c.pale : tone === "blue" ? c.blue : c.white
      }
      borderWidth={1}
      borderColor={tone === "white" ? c.line : "transparent"}
    >
      {children}
    </YStack>
  );
}
export function Frame({
  children,
  title,
  eyebrow,
  subtitle,
  back = false,
}: PropsWithChildren<{
  title: string;
  eyebrow?: string;
  subtitle?: string;
  back?: boolean;
}>) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.paper }}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <YStack
        width="100%"
        maxWidth={960}
        alignSelf="center"
        paddingHorizontal={24}
        paddingTop={30}
        gap={26}
      >
        {back && (
          <XStack>
            <Action
              secondary
              onPress={() => router.dismissTo("/")}
              icon="arrow-back"
            >
              ホーム
            </Action>
          </XStack>
        )}
        <YStack gap={9}>
          {eyebrow && <Label>{eyebrow}</Label>}
          <Title>{title}</Title>
          {subtitle && <Body muted>{subtitle}</Body>}
        </YStack>
        {children}
      </YStack>
    </ScrollView>
  );
}
export function Field(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      minHeight={54}
      fontSize={17}
      borderColor={c.line}
      backgroundColor={c.white}
      color={c.ink}
      borderRadius={14}
    />
  );
}
export function ErrorNotice({ text }: { text: string }) {
  return (
    <YStack
      backgroundColor="#FBEFE6"
      padding={16}
      borderRadius={14}
      accessibilityRole="alert"
    >
      <Text color={c.error} lineHeight={23}>
        {text}
      </Text>
    </YStack>
  );
}
export function Meter({ value }: { value: number }) {
  return (
    <YStack
      height={7}
      borderRadius={5}
      backgroundColor={c.line}
      overflow="hidden"
    >
      <YStack
        height={7}
        borderRadius={5}
        width={`${Math.max(0, Math.min(100, value * 100))}%`}
        backgroundColor={c.green}
      />
    </YStack>
  );
}
