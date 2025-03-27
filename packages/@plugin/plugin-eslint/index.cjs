const PluginConfig = require("./generator/index");

const pluginEslint = (buildTool) => {
  return PluginConfig[buildTool] ?? console.warn(`Unsupported build tool: ${buildTool}`);
};

module.exports = {
  pluginEslint,
};
