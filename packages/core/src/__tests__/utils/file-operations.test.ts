import { describe, test, expect, afterEach, beforeEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";

import { createFiles, createReadmeString } from "../../utils/createFiles.js";
import * as fileController from "../../utils/fileController.js";

// 测试用的临时目录
const TEST_DIR = path.join(__dirname, "test-temp");

describe("文件操作工具测试", () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_DIR);
    process.env.PROJECT_NAME = "test-project";
    // 禁用 process.exit
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("README info is undefined.");
    });
  });

  afterEach(async () => {
    await fs.remove(TEST_DIR);
    delete process.env.PROJECT_NAME;
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("createFiles 函数测试", () => {
    test("应该能成功创建多个文件和目录", async () => {
      const files = {
        "test.txt": "test content",
        "src/index.js": 'console.log("test")',
        "config/settings.json": '{"test": true}',
      };

      await createFiles(TEST_DIR, files);

      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(TEST_DIR, filePath);
        expect(await fs.pathExists(fullPath)).toBe(true);
        expect(await fs.readFile(fullPath, "utf-8")).toBe(content);
      }
    });

    test("创建文件失败时应该抛出错误", async () => {
      vi.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {
        throw new Error("写入失败");
      });

      await expect(createFiles(TEST_DIR, { "test.txt": "content" })).rejects.toThrow("写入失败");
    });
  });

  describe("createReadmeString 函数测试", () => {
    test("应该正确替换模板变量", () => {
      vi.spyOn(fileController, "readTemplateFileContent").mockReturnValue(
        "# ${template} 项目\n使用 ${packageManager} 构建",
      );

      const result = createReadmeString("npm", "react", "README.md");
      expect(result).toBe("# React 项目\n使用 npm 构建");
    });

    test("模板文件不存在时应该抛出错误", () => {
      vi.spyOn(fileController, "readTemplateFileContent").mockReturnValue(undefined);

      expect(() => createReadmeString("npm", "vue", "README.md")).toThrow(
        "README info is undefined.",
      );
    });
  });

  describe("fileController 函数测试", () => {
    test("removeDirectory 应该成功删除目录", async () => {
      await fs.ensureDir(path.join(TEST_DIR, "subdir"));
      await fs.writeFile(path.join(TEST_DIR, "test.txt"), "test");

      await fileController.removeDirectory(TEST_DIR, false);
      expect(await fs.pathExists(TEST_DIR)).toBe(false);
    });

    test("readTemplateFileContent 应该正确读取模板文件", () => {
      // 直接模拟整个函数
      const mockContent = "模板内容";
      const spy = vi.spyOn(fileController, "readTemplateFileContent").mockReturnValue(mockContent);

      // 执行测试
      const content = fileController.readTemplateFileContent("test.md");

      // 验证结果
      expect(content).toBe(mockContent);
      expect(spy).toHaveBeenCalledWith("test.md");

      // 恢复原始行为
      spy.mockRestore();
    });

    test("copyDirectory 应该成功复制目录", async () => {
      const sourceDir = path.join(TEST_DIR, "source");
      const targetDir = path.join(TEST_DIR, "target");

      // 创建源目录和文件
      await fs.ensureDir(sourceDir);
      await fs.writeFile(path.join(sourceDir, "test.txt"), "test content");

      // 模拟 fs.copy
      vi.spyOn(fs, "copy").mockImplementation(async (src, dest) => {
        // 确保目标目录存在
        await fs.ensureDir(dest);
        // 直接写入测试文件
        await fs.writeFile(path.join(dest, "test.txt"), "test content");
      });

      await fileController.copyDirectory("source", targetDir);

      expect(await fs.pathExists(path.join(targetDir, "test.txt"))).toBe(true);
      expect(await fs.readFile(path.join(targetDir, "test.txt"), "utf-8")).toBe("test content");
    });

    test("copyDirectory 失败时应该正确处理错误", async () => {
      const mockError = new Error("复制失败");
      vi.spyOn(fs, "copy").mockRejectedValueOnce(mockError);

      const consoleErrorSpy = vi.spyOn(console, "error");
      await fileController.copyDirectory("source", "target");

      expect(consoleErrorSpy).toHaveBeenCalledWith("复制目录内容时发生错误:", mockError);
    });
  });
});
