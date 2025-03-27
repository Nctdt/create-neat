import { pluginToBuildToolProtocol } from "../../../core/dist/src/configs/protocol"; // 推荐使用明确类型导出
// 类型定义
interface GeneratorAPI {
  extendPackage: (config: object) => void;
  protocolGenerate: (config: object) => void;
}

// 主插件逻辑
const swcPlugin = (
  generatorAPI: GeneratorAPI,
  template: "react" | "vue", // 根据实际模板类型调整
  buildTool: "webpack" | "vite" | "rollup", // 根据支持的构建工具调整
) => {
  // 类型安全的配置对象
  const packageConfig = {
    swc: {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: template === "react", // 根据模板自动启用 tsx
          jsx: template === "react", // 根据模板自动启用 jsx
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
  };

  // 添加包配置
  generatorAPI.extendPackage(packageConfig);

  // 生成构建工具协议
  generatorAPI.protocolGenerate({
    [pluginToBuildToolProtocol.ADD_COMPILER_CONFIG]: {
      compiler: "swc",
      template,
      buildTool,
    },
  });
};

export default swcPlugin;
