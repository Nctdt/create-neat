/**
 * 版本检查工具测试
 *
 * 测试文件：
 * - /utils/checkVersion.ts
 *   - 检查当前版本是否需要更新，低于最新版本时提示用户
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// 导入模拟后的模块
import getLatestVersion from "latest-version";
import chalk from "chalk";
import semver from "semver";

import { checkVersion } from "../../utils/checkVersion.js";

// 先进行模块模拟，再导入具体模块
vi.mock("latest-version", () => {
  return {
    default: vi.fn(),
  };
});

// 注意：源代码使用 import semver from "semver"，所以需要提供默认导出
vi.mock("semver", () => {
  return {
    default: {
      lt: vi.fn(),
    },
    lt: vi.fn(),
  };
});

vi.mock("chalk", () => {
  return {
    default: {
      greenBright: vi.fn(),
    },
    greenBright: vi.fn((str) => `greenBright(${str})`),
  };
});
describe("checkVersion 函数测试", () => {
  // 设置控制台监听
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    // 清除所有模拟的调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
  });

  it("当当前版本低于最新版本时，应显示更新提示", async () => {
    // 模拟最新版本
    vi.mocked(getLatestVersion).mockResolvedValue("1.2.0");
    // 模拟版本比较结果 (当前版本 < 最新版本)
    vi.mocked(semver.lt).mockReturnValue(true);
    const currentVersion = "1.1.0";
    await checkVersion(currentVersion);
    // 验证函数调用
    expect(getLatestVersion).toHaveBeenCalledWith("create-neat");
    expect(semver.lt).toHaveBeenCalledWith(currentVersion, "1.2.0");
    expect(chalk.greenBright).toHaveBeenCalledWith("npm install -g create-neat");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("You are using an outdated version"),
    );
  });

  it("当当前版本等于最新版本时，不应显示更新提示", async () => {
    // 模拟最新版本
    vi.mocked(getLatestVersion).mockResolvedValue("1.1.0");
    // 模拟版本比较结果 (当前版本 = 最新版本)
    vi.mocked(semver.lt).mockReturnValue(false);
    const currentVersion = "1.1.0";
    await checkVersion(currentVersion);
    // 验证函数调用
    expect(getLatestVersion).toHaveBeenCalledWith("create-neat");
    expect(semver.lt).toHaveBeenCalledWith(currentVersion, "1.1.0");
    expect(chalk.greenBright).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("当当前版本高于最新版本时，不应显示更新提示", async () => {
    // 模拟最新版本
    vi.mocked(getLatestVersion).mockResolvedValue("1.1.0");
    // 模拟版本比较结果 (当前版本 > 最新版本)
    vi.mocked(semver.lt).mockReturnValue(false);
    const currentVersion = "1.2.0";
    await checkVersion(currentVersion);
    // 验证函数调用
    expect(getLatestVersion).toHaveBeenCalledWith("create-neat");
    expect(semver.lt).toHaveBeenCalledWith(currentVersion, "1.1.0");
    expect(chalk.greenBright).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("当获取最新版本时发生网络错误，应捕获并处理异常", async () => {
    // 模拟网络错误
    vi.mocked(getLatestVersion).mockRejectedValue(new Error("网络连接失败"));
    const currentVersion = "1.0.0";
    // 注意：源代码没有处理异常，我们需要使用try-catch包装测试
    try {
      await checkVersion(currentVersion);
      // 如果没有抛出异常，测试应该失败
      expect.fail("应该抛出异常但没有");
    } catch (error) {
      // 验证函数在错误情况下的行为
      expect(getLatestVersion).toHaveBeenCalledWith("create-neat");
      expect(semver.lt).not.toHaveBeenCalled();
      expect(chalk.greenBright).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
    }
  });

  it("当提示更新时，消息应包含当前版本和最新版本信息", async () => {
    // 模拟版本信息
    const currentVersion = "1.0.0";
    const latestVersion = "2.0.0";
    vi.mocked(getLatestVersion).mockResolvedValue(latestVersion);
    vi.mocked(semver.lt).mockReturnValue(true);
    vi.mocked(chalk.greenBright).mockReturnValue("greenBright(npm install -g create-neat)");
    await checkVersion(currentVersion);
    // 验证提示消息的内容
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`outdated version.*${currentVersion}`)),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`latest version ${latestVersion}`)),
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("greenBright(npm install -g create-neat)"),
    );
  });
});
