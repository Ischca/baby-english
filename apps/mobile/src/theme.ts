import { createTamagui } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";
export const config = createTamagui({
  ...defaultConfig,
  settings: { ...defaultConfig.settings, onlyAllowShorthands: false, allowedStyleValues: false },
});
export const palette = {
  ink: "#25463C", muted: "#718279", paper: "#F5F8F2", green: "#2D7A61",
  deep: "#1D5845", pale: "#E6F2DF", orange: "#F5B85F", peach: "#FFF0D9",
  blue: "#E5F1F6", lilac: "#EEE8F8", line: "#DFE8DC", white: "#FFFFFF",
  error: "#A84A39", chat: "#EDF3EB", gold: "#AA711C",
} as const;
type AppConfig = typeof config;
declare module "tamagui" {
  // Tamagui uses declaration merging to infer the application's tokens.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
