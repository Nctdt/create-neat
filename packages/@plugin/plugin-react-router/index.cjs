const PluginConfig = require("./generator/index");

const pluginReactrouter = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginReactrouter,
};
