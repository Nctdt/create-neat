const TSPluginNames = [
  "element-plus",
  "babel",
  "eslint",
  "husky",
  "mobx",
  "pinia",
  "prettier",
  "react-router",
  "scss",
  "typescript",
];

const judgePluginPath = (pluginName: string) => {
  let pluginPath = `packages/@plugin/plugin-${pluginName}`;
  let suffix = "js";
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
