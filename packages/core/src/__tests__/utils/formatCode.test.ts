/**
 * 代码格式化工具测试
 *
 * 测试文件：
 * - /utils/formatCode.ts
 *   - 代码格式化
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import prettier from "prettier";

import formatCode from "../../utils/formatCode.js";

// 模拟prettier
vi.mock("prettier", () => ({
  default: {
    format: vi.fn(),
  },
}));

describe("formatCode 函数测试", () => {
  const mockFormat = prettier.format as Mock;

  beforeEach(() => {
    // 清除所有模拟的调用记录
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
  });

  it("当文件扩展名不需要格式化时，应直接返回原代码", async () => {
    const code = "const a = 1";
    const extension = "md";

    const result = await formatCode(code, extension);

    expect(result).toBe(code);
    expect(mockFormat).not.toHaveBeenCalled();
  });

  it("应移除代码中的特定注释标记", async () => {
    const code = `
      import { ref } from 'vue';
      /* slot: use-pinia-slot */
      const count = ref(0);
    `;
    const extension = "js";
    const expectedFormattedCode = "formatted code";

    // 模拟prettier.format的返回值
    mockFormat.mockResolvedValueOnce(expectedFormattedCode);

    const result = await formatCode(code, extension);

    // 验证调用参数中注释已被移除
    const cleanedCode = code.replace(/\/\*\s*slot:\s*\w+(?:-\w+)*\s*\*\//g, "");
    expect(mockFormat).toHaveBeenCalledWith(
      cleanedCode,
      expect.objectContaining({
        parser: "babel",
        plugins: expect.any(Array),
      }),
    );
    expect(result).toBe(expectedFormattedCode);
  });

  it("处理Vue文件时应使用正确的parser", async () => {
    const code = "const a = 1";
    const extension = "vue";
    const expectedFormattedCode = "formatted vue code";

    mockFormat.mockResolvedValueOnce(expectedFormattedCode);

    const result = await formatCode(code, extension);

    expect(mockFormat).toHaveBeenCalledWith(
      code,
      expect.objectContaining({
        parser: "vue",
        plugins: expect.any(Array),
      }),
    );
    expect(result).toBe(expectedFormattedCode);
  });

  it("应正确处理多个注释标记", async () => {
    const code = `
      /* slot: use-pinia-slot */
      import { ref } from 'vue';
      const count = ref(0);
      /* slot: use-router-slot */
    `;
    const extension = "ts";
    const expectedFormattedCode = "formatted typescript code";

    mockFormat.mockResolvedValueOnce(expectedFormattedCode);

    const result = await formatCode(code, extension);

    // 验证调用参数中所有注释已被移除
    const cleanedCode = code.replace(/\/\*\s*slot:\s*\w+(?:-\w+)*\s*\*\//g, "");
    expect(mockFormat).toHaveBeenCalledWith(cleanedCode, expect.any(Object));
    expect(result).toBe(expectedFormattedCode);
  });
});
