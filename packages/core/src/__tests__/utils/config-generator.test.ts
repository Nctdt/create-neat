/**
 * 配置生成相关工具方法测试
 *
 * 待测试文件：
 * - /utils/generateBuildToolConfigFromEJS.ts
 *   - 从 EJS 模板生成构建工具配置
 * - /utils/preset.ts
 *   - 预设配置相关
 * - /utils/options.ts
 *   - 选项配置相关
 */

import os from "os";
import fs from "fs";
import path from "path";
import { describe, test, expect, beforeEach, vi, type Mock } from "vitest";

import generateBuildToolConfigFromEJS from "../../utils/generateBuildToolConfigFromEJS.js";
import { Preset, getPreset, defaultPreset } from "../../utils/preset.js";
import { savePresetToRcPath, loadRcOptions, getRcPath } from "../../utils/options.js";

// 模拟fs模块
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

describe("generateBuildToolConfigFromEJS 函数测试", () => {
  test("应正确渲染EJS模板", () => {
    // 准备测试数据
    const options = {
      name: "test-project",
      version: "1.0.0",
    };
    const template = `{
  "name": "<%= name %>",
  "version": "<%= version %>"
}`;

    // 期望的渲染结果
    const expectedOutput = `{
  "name": "test-project",
  "version": "1.0.0"
}`;

    // 调用被测试函数
    const result = generateBuildToolConfigFromEJS(options, template);

    // 验证结果
    expect(result).toBe(expectedOutput);
  });

  test("应处理包含条件逻辑的EJS模板", () => {
    // 准备测试数据
    const options = {
      name: "test-project",
      useTypeScript: true,
      dependencies: ["react", "redux"],
    };
    const template = `{
  "name": "<%= name %>",
  <% if (useTypeScript) { %>
  "devDependencies": {
    "typescript": "^4.5.0"
  },
  <% } %>
  "dependencies": {
    <% dependencies.forEach((dep, index) => { %>
    "<%= dep %>": "latest"<%= index < dependencies.length - 1 ? ',' : '' %>
    <% }); %>
  }
}`;

    // 调用被测试函数
    const result = generateBuildToolConfigFromEJS(options, template);

    // 验证结果包含TypeScript和列出的依赖项
    expect(result).toContain('"name": "test-project"');
    expect(result).toContain('"typescript": "^4.5.0"');
    expect(result).toContain('"react": "latest"');
    expect(result).toContain('"redux": "latest"');
  });
});

describe("preset 工具函数测试", () => {
  test("getPreset 应返回正确的预设配置对象", () => {
    // 准备测试数据
    const template = "react";
    const buildTool = "webpack";
    const plugins = ["eslint", "babel"];
    const packageManager = "npm";
    const npmSource = "https://registry.npmjs.org/";
    const extraConfigFiles = true;

    // 调用被测试函数
    const result = getPreset(
      template,
      buildTool,
      plugins,
      packageManager,
      npmSource,
      extraConfigFiles,
    );

    // 验证结果
    expect(result).toEqual({
      template: "react",
      buildTool: "webpack",
      plugins: {
        eslint: {},
        babel: {},
      },
      packageManager: "npm",
      npmSource: "https://registry.npmjs.org/",
      extraConfigFiles: true,
    });
  });

  test("defaultPreset 应包含预定义的模板预设", () => {
    // 验证 Vue 预设配置
    expect(defaultPreset.vue).toHaveProperty("template", "vue");
    expect(defaultPreset.vue).toHaveProperty("buildTool", "webpack");
    expect(defaultPreset.vue.plugins).toHaveProperty("eslint");
    expect(defaultPreset.vue.plugins).toHaveProperty("babel");

    // 验证 React 预设配置
    expect(defaultPreset.react).toHaveProperty("template", "react");
    expect(defaultPreset.react).toHaveProperty("buildTool", "webpack");
    expect(defaultPreset.react.plugins).toHaveProperty("eslint");
    expect(defaultPreset.react.plugins).toHaveProperty("babel");
  });
});

describe("getRcPath 函数测试", () => {
  test("应返回正确的配置文件路径", () => {
    const filename = ".testrc";
    const expectedPath = path.join(os.homedir(), filename);

    // 调用被测试的函数
    const result = getRcPath(filename);

    expect(result).toBe(expectedPath);
  });
});

describe("options 工具函数测试", () => {
  beforeEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
    // 重置fs模拟
    (fs.existsSync as Mock).mockReset();
    (fs.readFileSync as Mock).mockReset();
    (fs.writeFileSync as Mock).mockReset();
  });

  test("loadRcOptions 应正确加载配置文件", () => {
    const mockConfig = {
      presets: {
        custom: {
          template: "custom-template",
          buildTool: "vite",
          plugins: { eslint: {} },
          packageManager: "yarn",
          npmSource: "",
          extraConfigFiles: false,
        },
      },
    };

    // 模拟文件存在
    (fs.existsSync as Mock).mockReturnValue(true);
    // 模拟文件内容
    (fs.readFileSync as Mock).mockReturnValue(JSON.stringify(mockConfig));

    // 调用被测试的函数
    const result = loadRcOptions();

    // 验证结果
    expect(result).toEqual(mockConfig);
    expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
    expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String), "utf-8");
  });

  test("savePresetToRcPath 应将预设保存到配置文件", () => {
    // 准备要保存的预设
    const preset: Preset = {
      template: "test-template",
      buildTool: "webpack",
      plugins: { test: {} },
      packageManager: "npm",
      npmSource: "",
      extraConfigFiles: true,
    };

    const presetName = "test-preset";

    // 模拟文件存在和读取现有配置
    (fs.existsSync as Mock).mockReturnValue(true);
    (fs.readFileSync as Mock).mockReturnValue(
      JSON.stringify({
        presets: {
          existing: {},
        },
      }),
    );

    // 模拟文件写入
    (fs.writeFileSync as Mock).mockImplementation(() => undefined);

    // 调用被测试的函数
    const result = savePresetToRcPath(preset, presetName);

    // 验证结果
    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"test-preset"'),
    );
  });
});
