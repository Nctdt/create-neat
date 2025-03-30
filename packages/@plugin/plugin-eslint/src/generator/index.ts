// plugins/eslint/generator/index.ts
import { pluginToBuildToolProtocol } from "../../../../core/dist/src/configs/protocol.js";
import type GeneratorAPI from "../../../../core/dist/src/models/GeneratorAPI.js";

// 通用 ESLint 配置基座
const baseESLintConfig = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "no-console": "warn",
    "no-unused-vars": "warn",
  },
};

// React 扩展配置
const reactExtensions = {
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "error",
  },
};

// Vue 扩展配置
const vueExtensions = {
  extends: ["plugin:vue/recommended"],
  plugins: ["vue"],
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/html-indent": ["error", 2],
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
};

// 依赖集合
const commonDeps = { eslint: "^8.32.0" };
const reactDeps = {
  "eslint-plugin-react": "^7.32.2",
  "eslint-plugin-react-hooks": "^4.6.0",
};
const vueDeps = {
  "eslint-plugin-vue": "^9.9.0",
  "@babel/eslint-parser": "^7.19.1",
};

export default (generatorAPI: GeneratorAPI, template: string, buildTool: string) => {
  // 根据模板合并配置
  const eslintConfig = { ...baseESLintConfig };
  let devDependencies = { ...commonDeps };

  if (template === "react") {
    Object.assign(eslintConfig, reactExtensions);
    devDependencies = { ...devDependencies, ...reactDeps };
  } else if (template === "vue") {
    Object.assign(eslintConfig, vueExtensions);
    devDependencies = { ...devDependencies, ...vueDeps };
  }
  // 注入 package.json 配置
  generatorAPI.extendPackage({
    eslint: eslintConfig,
    scripts: {
      lint: "eslint . --ext .js,.ts,.jsx,.tsx,.vue",
    },
    devDependencies,
  });
  // 调用协议注入构建工具配置（如 webpack 的 eslint-loader）
  generatorAPI.protocolGenerate({
    [pluginToBuildToolProtocol.ADD_COMPILER_CONFIG]: {
      compiler: "eslint",
      template,
      buildTool,
    },
  });
};
