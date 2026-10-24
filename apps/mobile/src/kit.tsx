import type { ComponentProps, PropsWithChildren } from "react";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Button, Text, XStack, YStack, Input } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { palette as c } from "./theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 21,
  color = c.ink,
}: {
  name: IconName;
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
      fontSize={small ? 12 : 15}
      lineHeight={small ? 19 : 24}
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
      fontSize={small ? 20 : 27}
      lineHeight={small ? 29 : 36}
      fontWeight="800"
      letterSpacing={-0.5}
    >
      {children}
    </Text>
  );
}
export function Label({ children }: PropsWithChildren) {
  return (
    <Text color={c.muted} fontSize={11} fontWeight="700" letterSpacing={0.7}>
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
  compact = false,
  accessibilityLabel,
}: PropsWithChildren<{
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
  icon?: IconName;
  compact?: boolean;
  accessibilityLabel?: string;
}>) {
  return (
    <Button
      testID={testID}
      accessibilityRole="button"
      {...(accessibilityLabel ? { accessibilityLabel } : {})}
      onPress={onPress}
      disabled={disabled}
      opacity={disabled ? 0.45 : 1}
      minHeight={compact ? 42 : 52}
      height="auto"
      paddingVertical={compact ? 9 : 13}
      paddingHorizontal={compact ? 14 : 20}
      borderRadius={18}
      backgroundColor={secondary ? c.white : c.green}
      borderWidth={1}
      borderBottomWidth={4}
      borderColor={secondary ? c.line : c.deep}
      color={secondary ? c.ink : c.white}
      fontSize={compact ? 13 : 15}
      fontWeight="700"
      pressStyle={{ y: 2, borderBottomWidth: 2 }}
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
export function IconButton({
  name,
  label,
  onPress,
  disabled = false,
  filled = false,
  size = 44,
  testID,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  filled?: boolean;
  size?: number;
  testID?: string;
}) {
  return (
    <Button
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      width={size}
      height={size}
      minWidth={44}
      minHeight={44}
      padding={0}
      borderRadius={16}
      borderWidth={0}
      backgroundColor={filled ? c.green : "transparent"}
      opacity={disabled ? 0.4 : 1}
      pressStyle={{ opacity: 0.65, scale: 0.94 }}
    >
      <Icon name={name} size={21} color={filled ? c.white : c.ink} />
    </Button>
  );
}
export function Chip({
  children,
  icon,
  selected = false,
  onPress,
}: PropsWithChildren<{
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
}>) {
  return (
    <Button
      accessibilityRole="button"
      {...(onPress ? { onPress } : { disabled: true })}
      height={36}
      paddingHorizontal={13}
      borderRadius={18}
      borderWidth={1}
      borderColor={selected ? c.green : c.line}
      backgroundColor={selected ? c.pale : c.white}
      color={c.ink}
      fontSize={12}
      fontWeight="700"
      {...(icon
        ? {
            icon: (
              <Icon
                name={icon}
                size={15}
                color={selected ? c.green : c.muted}
              />
            ),
          }
        : {})}
      pressStyle={{ opacity: 0.7 }}
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
      padding={18}
      gap={13}
      borderRadius={22}
      backgroundColor={
        tone === "green" ? c.pale : tone === "blue" ? c.blue : c.white
      }
      borderWidth={1}
      borderBottomWidth={3}
      borderColor={c.line}
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
    <YStack flex={1} minHeight={0} backgroundColor={c.paper}>
      <XStack
        paddingHorizontal={18}
        paddingTop={14}
        paddingBottom={14}
        alignItems="center"
        gap={10}
        borderBottomWidth={1}
        borderBottomColor={c.line}
        backgroundColor={c.paper}
      >
        {back && (
          <IconButton
            label="ホーム"
            name="chevron-back"
            onPress={() => router.dismissTo("/")}
          />
        )}
        <YStack flex={1} gap={3}>
          {eyebrow && <Label>{eyebrow}</Label>}
          <Text fontSize={22} lineHeight={29} color={c.ink} fontWeight="800">
            {title}
          </Text>
        </YStack>
      </XStack>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          width="100%"
          maxWidth={720}
          alignSelf="center"
          paddingHorizontal={18}
          paddingTop={18}
          gap={18}
        >
          {subtitle && (
            <Body muted small>
              {subtitle}
            </Body>
          )}
          {children}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
export function Field(props: ComponentProps<typeof Input>) {
  return (
    <Input
      minHeight={50}
      fontSize={16}
      borderColor={c.line}
      backgroundColor={c.white}
      color={c.ink}
      borderRadius={16}
      {...props}
    />
  );
}
export function ErrorNotice({ text }: { text: string }) {
  return (
    <YStack
      backgroundColor="#FCEAE4"
      padding={13}
      borderRadius={16}
      accessibilityRole="alert"
    >
      <Text color={c.error} fontSize={13} lineHeight={21}>
        {text}
      </Text>
    </YStack>
  );
}
export function Meter({ value }: { value: number }) {
  return (
    <YStack
      height={9}
      borderRadius={6}
      backgroundColor={c.line}
      overflow="hidden"
    >
      <YStack
        height={9}
        borderRadius={6}
        width={`${Math.max(0, Math.min(100, value * 100))}%`}
        backgroundColor={c.green}
      />
    </YStack>
  );
}
