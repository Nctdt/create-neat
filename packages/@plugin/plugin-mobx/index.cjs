const PluginConfig = require("./generator/index");

const pluginMobx = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginMobx,
};
