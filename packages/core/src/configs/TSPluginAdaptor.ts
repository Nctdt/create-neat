const TSPluginNames = ["element-plus", "babel"];

const judgePluginPath = (pluginName: string) => {
  let pluginPath = `packages/@plugin/plugin-${pluginName}`;
  let suffix = "cjs";
  if (TSPluginNames.includes(pluginName)) {
    pluginPath += "/dist";
    suffix = "js";
  }

  return {
    pluginIndexPath: `${pluginPath}/index.${suffix}`,
    pluginGeneratorPath: `${pluginPath}/generator/index.${suffix}`,
    pluginTemplatePath: `${pluginPath}/generator/template`,
  };
};

export { TSPluginNames, judgePluginPath };
