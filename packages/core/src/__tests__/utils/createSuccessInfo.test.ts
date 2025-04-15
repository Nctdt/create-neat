/**
 * 成功信息显示工具测试
 *
 * 测试文件：
 * - /utils/createSuccessInfo.ts
 *   - 创建项目成功后显示的信息用例测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import boxen from "boxen";
import chalk from "chalk";

import createSuccessInfo from "../../utils/createSuccessInfo.js";

// 模拟依赖
vi.mock("chalk", () => {
  const mockChalk = {
    blue: vi.fn((str) => `blue(${str})`),
    greenBright: vi.fn((str) => `greenBright(${str})`),
    cyan: vi.fn((str) => `cyan(${str})`),
  };
  return {
    default: mockChalk,
    ...mockChalk,
  };
});

vi.mock("boxen", () => {
  const mockBoxen = vi.fn((_str, _config) => `[boxen output]`);
  return {
    default: mockBoxen,
  };
});

describe("createSuccessInfo 函数测试", () => {
  // 监控标准输出和控制台日志
  const stdoutWriteSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    // 清除所有模拟的调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
  });

  it("应正确显示项目成功创建的信息", () => {
    const projectName = "test-project";
    const packageManager = "npm";

    createSuccessInfo(projectName, packageManager);

    // 验证chalk调用
    expect(chalk.greenBright).toHaveBeenCalledWith(projectName);
    expect(chalk.blue).toHaveBeenCalled();
    expect(chalk.cyan).toHaveBeenCalledWith(projectName);
    expect(chalk.cyan).toHaveBeenCalledWith(packageManager);

    // 验证boxen调用
    expect(boxen).toHaveBeenCalled();
    expect(boxen).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        borderColor: "cyan",
        title: "🚀 Congratulations",
      }),
    );

    // 验证输出调用
    expect(stdoutWriteSpy).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("👉 Get started with the following commands:");
  });

  it("应使用提供的包管理器名称", () => {
    const projectName = "my-app";
    const packageManager = "yarn";

    createSuccessInfo(projectName, packageManager);

    // 验证包管理器名称被传递给chalk.cyan
    expect(chalk.cyan).toHaveBeenCalledWith(packageManager);
    // 验证最后一次console.log调用包含包管理器名称
    expect(chalk.cyan).toHaveBeenCalledWith("yarn");
    // 由于命令行语句构造方式，我们需要验证chalk.cyan被传入了packageManager
    const cdCommand = consoleLogSpy.mock.calls[1][0];
    const startCommand = consoleLogSpy.mock.calls[2][0];
    expect(cdCommand).toContain("cd");
    expect(startCommand).toContain("start");
  });

  it("应在彩色输出中包含项目名称", () => {
    const projectName = "awesome-project";
    const packageManager = "npm";

    // 设置chalk.blue的实现，确保它能正确模拟函数行为
    vi.mocked(chalk.blue).mockImplementation((str) => {
      // 确保str包含项目名称的引用
      return `blue(${str})`;
    });
    vi.mocked(chalk.greenBright).mockImplementation((str: string): string => {
      // 直接返回项目名称，以便后续在chalk.blue中使用
      return str;
    });

    createSuccessInfo(projectName, packageManager);

    // 验证项目名称在chalk调用中使用
    expect(chalk.greenBright).toHaveBeenCalledWith(projectName);
    expect(chalk.cyan).toHaveBeenCalledWith(projectName);
    // 验证chalk.blue和chalk.greenBright的调用关系
    expect(chalk.blue).toHaveBeenCalled();
    expect(chalk.greenBright).toHaveBeenCalledWith(projectName);
  });
});
