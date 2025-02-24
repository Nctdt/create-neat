const frameworkConfigs = {
  vue: () => {
    return {};
  },

  react: () => {
    return {};
  },
};

const pluginWebpackScript = (framework: string) => {
  const configHandler = frameworkConfigs[framework];

  if (configHandler) {
    return configHandler();
  } else {
    console.warn(`Unsupported framework: ${framework}`);
  }
};

export default pluginWebpackScript;
