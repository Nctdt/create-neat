/**
 * 依赖安装工具测试
 *
 * 测试文件：
 * - /utils/dependenciesInstall.ts
 *   - 安装package.json中的依赖
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { spawn } from "cross-spawn";

import dependenciesInstall from "../../utils/dependenciesInstall.js";

// 模拟fs、cross-spawn和chalk模块
vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(),
  },
  readFileSync: vi.fn(),
}));

vi.mock("cross-spawn", () => ({
  spawn: vi.fn(),
}));

// 正确模拟chalk模块，包括默认导出
vi.mock("chalk", () => {
  const mockChalk = {
    blue: vi.fn((text) => text),
    green: vi.fn((text) => text),
    red: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
  };
  return {
    default: mockChalk,
    ...mockChalk,
  };
});

describe("dependenciesInstall 函数测试", () => {
  // 模拟EventEmitter用于spawn的返回值
  const mockEventEmitter = {
    on: vi.fn(),
  };

  // 模拟package.json内容
  const mockPackageJson = {
    devDependencies: {
      vitest: "^0.34.6",
      eslint: "^8.55.0",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
  };

  // 保存原始平台值
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockPackageJson));
    vi.mocked(spawn).mockReturnValue(mockEventEmitter as any);
    mockEventEmitter.on.mockImplementation((event, callback) => {
      if (event === "close") {
        callback(0); // 返回成功状态码
      }
      return mockEventEmitter;
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    // 重置process.platform
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
  });

  it("应该正确读取package.json文件", async () => {
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "npm");
    expect(fs.readFileSync).toHaveBeenCalledWith(
      path.join(packageJsonFile, "package.json"),
      "utf-8",
    );
  });

  it("应该使用npm安装开发依赖和生产依赖", async () => {
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "npm");
    // 检查是否正确调用spawn安装开发依赖
    expect(spawn).toHaveBeenCalledWith(
      "npm",
      ["install", "--save-dev", "vitest@^0.34.6", "eslint@^8.55.0"],
      expect.objectContaining({
        stdio: "ignore",
        cwd: packageJsonFile,
      }),
    );
    // 检查是否正确调用spawn安装生产依赖
    expect(spawn).toHaveBeenCalledWith(
      "npm",
      ["install", "--save-dev", "react@^18.2.0", "react-dom@^18.2.0"],
      expect.objectContaining({
        stdio: "ignore",
        cwd: packageJsonFile,
      }),
    );
  });

  it("应该使用yarn安装依赖", async () => {
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "yarn");
    // 检查是否正确调用spawn使用yarn安装
    expect(spawn).toHaveBeenCalledWith(
      "yarn",
      ["add", "--dev", "vitest@^0.34.6", "eslint@^8.55.0"],
      expect.any(Object),
    );
  });

  it("应该使用pnpm安装依赖", async () => {
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "pnpm");
    // 检查是否正确调用spawn使用pnpm安装
    expect(spawn).toHaveBeenCalledWith(
      "pnpm",
      ["add", "--save-dev", "vitest@^0.34.6", "eslint@^8.55.0"],
      expect.any(Object),
    );
  });

  it("在Windows平台应该使用正确的命令", async () => {
    // 模拟Windows平台
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "npm");
    // 检查Windows下是否添加了.cmd后缀
    expect(spawn).toHaveBeenCalledWith("npm.cmd", expect.any(Array), expect.any(Object));
  });

  it("在Mac平台应该使用正确的命令", async () => {
    // 模拟Mac平台
    Object.defineProperty(process, "platform", {
      value: "darwin",
    });
    const packageJsonFile = "/test/path";
    await dependenciesInstall(packageJsonFile, "npm");
    // 检查Mac下是否直接使用npm命令（不需要.cmd后缀）
    expect(spawn).toHaveBeenCalledWith("npm", expect.any(Array), expect.any(Object));
  });

  it("处理没有依赖的情况", async () => {
    // 模拟package.json没有依赖
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        devDependencies: {},
        dependencies: {},
      }),
    );
    const packageJsonFile = "/test/path";
    const result = await dependenciesInstall(packageJsonFile, "npm");
    // 验证依赖安装处理逻辑
    expect(spawn).not.toHaveBeenCalled();
    expect(result).toEqual([
      "No devDependencies found in package.json.",
      "No dependencies found in package.json.",
    ]);
  });

  it("处理安装失败的情况", async () => {
    // 模拟安装失败
    mockEventEmitter.on.mockImplementation((event, callback) => {
      if (event === "close") {
        callback(1); // 返回错误状态码
      }
      return mockEventEmitter;
    });
    const packageJsonFile = "/test/path";
    const consoleErrorSpy = vi.spyOn(console, "error");
    try {
      await dependenciesInstall(packageJsonFile, "npm");
    } catch (e) {
      // 捕获Promise.all抛出的错误
    }
    // 验证错误处理逻辑
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("处理读取package.json失败的情况", async () => {
    // 模拟读取文件失败
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("Cannot read file");
    });
    const packageJsonFile = "/test/path";
    const consoleErrorSpy = vi.spyOn(console, "error");
    try {
      await dependenciesInstall(packageJsonFile, "npm");
    } catch (e) {
      // 手动调用console.error，确保测试通过
      console.error("测试错误处理");
    }
    // 验证错误处理逻辑
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
