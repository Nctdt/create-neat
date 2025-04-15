/**
 * 命令行交互相关工具方法测试
 *
 * 测试文件：
 * - /utils/ProjectSelect.ts
 *   - 命令行交互选择
 * - /utils/getnpmSource.ts
 *   - 获取 npm 源
 */

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as clackPrompts from "@clack/prompts";
import { execSync } from "child_process";

import { projectSelect } from "../../utils/select.js";
import { savePresetToRcPath, loadRcOptions, getRcPath } from "../../utils/options.js";
import { getPreset } from "../../utils/preset.js";

// 模拟依赖
vi.mock("@clack/prompts", async () => ({
  select: vi.fn(),
  multiselect: vi.fn(),
  intro: vi.fn(),
  confirm: vi.fn(),
  text: vi.fn(),
}));

vi.mock("chalk", () => ({
  default: {
    green: vi.fn((str) => str),
    yellow: vi.fn((str) => str),
    greenBright: vi.fn((str) => str),
  },
}));

// 修改 child_process 的 mock 实现
vi.mock("child_process", () => {
  const mockExecSync = vi.fn(() => Buffer.from("https://registry.npmjs.org/\n"));
  return { execSync: mockExecSync };
});

vi.mock("fs", async () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

vi.mock("../../utils/options", async () => ({
  loadRcOptions: vi.fn(),
  savePresetToRcPath: vi.fn(),
  getRcPath: vi.fn(),
}));

vi.mock("../../utils/preset", async () => ({
  defaultPreset: {
    "preset-1": {
      template: "react",
      buildTool: "webpack",
      plugins: { eslint: true, prettier: true },
    },
  },
  getPreset: vi.fn(),
}));

vi.mock("../../utils/getnpmSource", async () => ({
  getNpmSource: vi.fn(() => [
    { value: "https://registry.npmjs.org/", label: "npm" },
    { value: "https://registry.npmmirror.com/", label: "taobao" },
  ]),
}));

describe("projectSelect - 命令行交互选择", () => {
  const mockExecSync = execSync as Mock;
  const mockSelect = clackPrompts.select as Mock;
  const mockMultiselect = clackPrompts.multiselect as Mock;
  const mockConfirm = clackPrompts.confirm as Mock;
  const mockText = clackPrompts.text as Mock;
  const mockLoadRcOptions = loadRcOptions as Mock;
  const mockGetPreset = getPreset as Mock;
  const mockSavePresetToRcPath = savePresetToRcPath as Mock;
  const mockGetRcPath = getRcPath as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    // 模拟默认的 npm registry
    mockExecSync.mockReturnValue("https://registry.npmjs.org/\n");
    // 模拟默认的配置选项
    mockLoadRcOptions.mockReturnValue({
      presets: {},
      npmRegistry: "https://registry.npmjs.org/",
      template: "react",
    });
  });

  it("选择已有预设时应返回预设配置", async () => {
    // 准备
    const mockPreset = {
      template: "react",
      buildTool: "webpack",
      plugins: { eslint: true, prettier: true },
      npmSource: "https://registry.npmjs.org/",
    };

    mockSelect.mockResolvedValueOnce("preset-1");
    mockLoadRcOptions.mockReturnValue({
      presets: {
        "preset-1": mockPreset,
      },
    });

    // 执行
    const result = await projectSelect();

    // 验证
    expect(result).toEqual(mockPreset);
    expect(clackPrompts.intro).toHaveBeenCalledWith(expect.any(String));
    expect(mockSelect).toHaveBeenCalledWith({
      message: "Please pick a preset:",
      options: expect.arrayContaining([
        expect.objectContaining({ value: "preset-1" }),
        expect.objectContaining({ value: "", label: "Manually select preset" }),
      ]),
    });
  });

  it("手动配置时应正确处理所有选项", async () => {
    // 准备
    const mockSelections = {
      template: "react",
      language: "typescript",
      buildTool: "webpack",
      transpilers: "babel",
      normalPlugins: ["eslint", "prettier"],
      specialPlugins: ["mobx"],
      packageManager: "pnpm",
      extraConfigFiles: true,
    };

    // 模拟用户选择
    mockSelect
      .mockResolvedValueOnce("") // 选择手动配置
      .mockResolvedValueOnce(mockSelections.template)
      .mockResolvedValueOnce(mockSelections.language)
      .mockResolvedValueOnce(mockSelections.buildTool)
      .mockResolvedValueOnce(mockSelections.transpilers)
      .mockResolvedValueOnce(mockSelections.packageManager)
      .mockResolvedValueOnce(mockSelections.extraConfigFiles)
      .mockResolvedValueOnce(false); // 不保存预设

    mockMultiselect
      .mockResolvedValueOnce(mockSelections.normalPlugins)
      .mockResolvedValueOnce(mockSelections.specialPlugins);

    mockConfirm.mockResolvedValueOnce(false); // 不切换 npm 源

    const mockPreset = {
      template: mockSelections.template,
      buildTool: mockSelections.buildTool,
      plugins: [...mockSelections.normalPlugins, ...mockSelections.specialPlugins],
      packageManager: mockSelections.packageManager,
      npmSource: "https://registry.npmjs.org/",
      extraConfigFiles: mockSelections.extraConfigFiles,
    };

    mockGetPreset.mockReturnValue(mockPreset);

    // 执行
    const result = await projectSelect();

    // 验证
    expect(result).toEqual(mockPreset);
    expect(mockSelect).toHaveBeenCalledTimes(8);
    expect(mockMultiselect).toHaveBeenCalledTimes(2);
    expect(mockGetPreset).toHaveBeenCalledWith(
      mockSelections.template,
      mockSelections.buildTool,
      expect.arrayContaining([
        ...mockSelections.normalPlugins,
        ...mockSelections.specialPlugins,
        mockSelections.language,
        mockSelections.transpilers,
      ]),
      mockSelections.packageManager,
      "https://registry.npmjs.org/",
      mockSelections.extraConfigFiles,
    );
  });

  it("应正确处理 npm 源切换", async () => {
    // 准备
    const newNpmSource = "https://registry.npmmirror.com/";

    mockSelect
      .mockResolvedValueOnce("") // 选择手动配置
      .mockResolvedValueOnce("react") // 模板选择
      .mockResolvedValueOnce("javascript") // 语言选择
      .mockResolvedValueOnce("webpack") // 构建工具
      .mockResolvedValueOnce("babel") // 编译器
      .mockResolvedValueOnce("npm") // 包管理器
      .mockResolvedValueOnce(true) // 配置文件位置
      .mockResolvedValueOnce(false); // 不保存预设

    mockMultiselect
      .mockResolvedValueOnce(["eslint"]) // 普通插件
      .mockResolvedValueOnce([]); // 特殊插件

    mockConfirm.mockResolvedValueOnce(true); // 切换 npm 源

    const mockPreset = {
      template: "react",
      buildTool: "webpack",
      plugins: ["eslint", "babel"],
      packageManager: "npm",
      npmSource: newNpmSource,
      extraConfigFiles: true,
    };

    mockGetPreset.mockReturnValue(mockPreset);

    // 执行
    const result = await projectSelect();

    // 验证
    expect(result).toEqual(mockPreset);
    expect(mockConfirm).toHaveBeenCalledWith({
      message: "Would you like to switch the npm registry?",
      initialValue: false,
    });
    expect(mockSelect).toHaveBeenCalledWith({
      message: "Pick a npm source for your project",
      initialValue: expect.any(String),
      options: expect.any(Array),
    });
  });

  it("应能保存新的预设配置", async () => {
    // 准备
    const presetName = "my-preset";

    mockSelect
      .mockResolvedValueOnce("") // 选择手动配置
      .mockResolvedValueOnce("react")
      .mockResolvedValueOnce("javascript")
      .mockResolvedValueOnce("webpack")
      .mockResolvedValueOnce("babel")
      .mockResolvedValueOnce("npm")
      .mockResolvedValueOnce(true) // 配置文件位置
      .mockResolvedValueOnce(true); // 保存预设

    mockMultiselect.mockResolvedValueOnce(["eslint"]).mockResolvedValueOnce([]);

    mockConfirm.mockResolvedValueOnce(false);
    mockText.mockResolvedValueOnce(presetName);
    mockSavePresetToRcPath.mockReturnValue(true);
    mockGetRcPath.mockReturnValue("/mock/.neatrc");

    // 执行
    await projectSelect();

    // 验证
    expect(mockSavePresetToRcPath).toHaveBeenCalled();
    expect(mockText).toHaveBeenCalledWith({
      message: "Save preset as:",
      placeholder: "Please input presets name:",
    });
  });
});
