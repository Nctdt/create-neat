import PluginConfig from "./config/index.js";

const pluginBabel = (buildTool: string) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

export default pluginBabel;
