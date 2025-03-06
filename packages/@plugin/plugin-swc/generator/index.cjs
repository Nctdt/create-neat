const protocol = require("../../../core/src/configs/protocol.ts");
const pluginToBuildToolProtocol = protocol.pluginToBuildToolProtocol;

module.exports = (generatorAPI, template, buildTool) => {
  generatorAPI.extendPackage({
    // swc 的文件内容↓
    swc: {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
          jsx: true,
        },
        transform: {
          react: {
            runtime: "automatic",
          },
        },
      },
    },
    devDependencies: {
      "@swc/core": "^1.5.6",
      "@swc/helpers": "^0.5.11",
      "swc-loader": "^0.2.6",
    },
  });

  generatorAPI.protocolGenerate({
    [pluginToBuildToolProtocol.ADD_COMPILER_CONFIG]: {
      compiler: "swc",
      template,
      buildTool,
    },
  });
};
