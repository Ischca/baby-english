const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");
// Existing v0 checkouts can retain nested pnpm links. All workspace packages
// must share the renderer's React instance when switching to the hoisted layout.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react" || moduleName.startsWith("react/")) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [workspaceRoot] }),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
