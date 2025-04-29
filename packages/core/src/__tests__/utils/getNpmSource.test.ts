/**
 * npm源获取工具测试
 *
 * 测试文件：
 * - /utils/getNpmSource.ts
 *   - 获取npm源列表并测试响应速度
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import https from "https";

import { npmRegistries } from "../../configs/npmRegistries.js";
import { getNpmSource } from "../../utils/getnpmSource.js";

// 模拟https模块
vi.mock("https", () => {
  return {
    default: {
      request: vi.fn(),
    },
    request: vi.fn(),
  };
});

describe("getNpmSource 函数测试", () => {
  // 创建模拟的请求和响应对象
  const mockReq = {
    on: vi.fn(),
    end: vi.fn(),
  };

  // 模拟一个可控的定时器
  const originalDateNow = Date.now;
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    // 重置Date.now模拟，用于控制时间间隔
    let callCount = 0;
    Date.now = vi.fn(() => {
      callCount++;
      return callCount === 1 ? 1000 : 1500; // 第一次调用返回1000，第二次返回1500，模拟500ms响应时间
    });

    // 设置https.request的返回值
    vi.mocked(https.request).mockImplementation((url, callback) => {
      // 保存回调函数，立即调用模拟响应
      if (callback && typeof callback === "function") {
        (callback as (response: any) => void)({} as any);
      }
      return mockReq as any;
    });
    // 重置console.error，以便于每个测试用例独立间谍
    console.error = originalConsoleError;
  });

  afterEach(() => {
    vi.resetAllMocks();
    Date.now = originalDateNow; // 恢复原始的Date.now
    console.error = originalConsoleError; // 恢复原始的console.error
  });

  it("应返回所有配置的npm源", () => {
    const sources = getNpmSource();
    // 验证返回的源列表包含所有在npmRegistries中定义的源
    Object.keys(npmRegistries).forEach((key) => {
      expect(sources).toContainEqual({
        label: key,
        value: npmRegistries[key].registry,
      });
    });
  });

  it("应该为每个源创建https请求", () => {
    getNpmSource();
    // 验证是否对每个源调用了https.request
    expect(https.request).toHaveBeenCalledTimes(Object.keys(npmRegistries).length);
    // 验证是否使用了正确的URL
    Object.values(npmRegistries).forEach((registry) => {
      expect(https.request).toHaveBeenCalledWith(registry.registry, expect.any(Function));
    });
  });

  it("应该为请求添加错误处理", () => {
    getNpmSource();
    // 验证是否为每个请求添加了错误处理程序
    expect(mockReq.on).toHaveBeenCalledTimes(Object.keys(npmRegistries).length);
    expect(mockReq.on).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("应该完成每个请求", () => {
    getNpmSource();
    // 验证是否完成了每个请求
    expect(mockReq.end).toHaveBeenCalledTimes(Object.keys(npmRegistries).length);
  });

  it("应计算每个源的响应时间", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getNpmSource();
    // 验证没有错误记录
    expect(consoleSpy).not.toHaveBeenCalled();
    // 验证使用Date.now计算时间间隔
    expect(Date.now).toHaveBeenCalled();
  });

  it("应处理请求错误", () => {
    // 模拟请求错误
    const mockError = new Error("网络错误");
    let errorCallback: ((error: Error) => void) | null = null;
    mockReq.on.mockImplementation((event, callback) => {
      if (event === "error") {
        errorCallback = callback;
      }
      return mockReq;
    });
    getNpmSource();
    // 触发error事件
    if (errorCallback) {
      errorCallback(mockError);
    }
    // 验证错误处理逻辑
    expect(mockReq.on).toHaveBeenCalledWith("error", expect.any(Function));
  });
});
