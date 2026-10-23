import { createTamagui } from "tamagui";
import { defaultConfig } from "@tamagui/config/v4";
export const config = createTamagui({
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
    allowedStyleValues: false,
  },
});
export const palette = {
  ink: "#21352D",
  muted: "#65736B",
  paper: "#F7F7F0",
  green: "#285945",
  pale: "#E6EEDC",
  orange: "#E6AA64",
  blue: "#E7EFF7",
  line: "#DEE3D9",
  white: "#FFFFFF",
  error: "#9D422F",
} as const;
type AppConfig = typeof config;
declare module "tamagui" {
  // Tamagui uses declaration merging to infer the application's tokens.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
