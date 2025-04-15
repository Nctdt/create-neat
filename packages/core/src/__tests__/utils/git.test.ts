/**
 * Git 相关工具方法测试
 *   - Git 环境和状态检查
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { execSync } from "child_process";

import gitCheck from "../../utils/gitCheck.js";

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

describe("Git 相关测试", () => {
  const mockExecSync = execSync as Mock;
  const testDir = "/test/project/dir";

  beforeEach(() => {
    // 清除所有模拟的调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
  });

  it("当系统未安装 Git 时，应返回 false", () => {
    // 模拟执行 git --version 命令失败
    mockExecSync.mockImplementationOnce(() => {
      throw new Error("git command not found");
    });

    const result = gitCheck(testDir);
    expect(result).toBe(false);
    expect(mockExecSync).toHaveBeenCalledWith("git --version");
  });

  it("当系统安装了 Git 但目录未初始化 Git 时，应返回 true", () => {
    // 模拟 git --version 成功
    mockExecSync.mockImplementationOnce(() => "git version 2.30.1");
    // 模拟 git status 失败（表示目录未初始化 Git）
    mockExecSync.mockImplementationOnce(() => {
      throw new Error("not a git repository");
    });

    const result = gitCheck(testDir);
    expect(result).toBe(true);
    expect(mockExecSync).toHaveBeenCalledWith("git --version");
    expect(mockExecSync).toHaveBeenCalledWith("git status", {
      stdio: "ignore",
      cwd: testDir,
    });
  });

  it("当目录已经初始化 Git 时，应返回 false", () => {
    // 模拟 git --version 成功
    mockExecSync.mockImplementationOnce(() => "git version 2.30.1");
    // 模拟 git status 成功（表示目录已初始化 Git）
    mockExecSync.mockImplementationOnce(() => "On branch main");

    const result = gitCheck(testDir);
    expect(result).toBe(false);
    expect(mockExecSync).toHaveBeenCalledWith("git --version");
    expect(mockExecSync).toHaveBeenCalledWith("git status", {
      stdio: "ignore",
      cwd: testDir,
    });
  });
});
