const PluginConfig = require("./generator/index");

const pluginHusky = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginHusky,
};
