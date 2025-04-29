/**
 * 通用工具函数测试
 *
 * 测试文件：
 * - /utils/commonUtils.ts
 *   - 通用工具函数
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { getTargetFileData, replaceDynamicSlot } from "../../utils/commonUtils.js";
import { FileData } from "../../models/FileTree.js";

describe("commonUtils 函数测试", () => {
  describe("getTargetFileData 函数测试", () => {
    // 模拟控制台错误输出
    let consoleErrorSpy: any;
    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });
    it("应该能正确查找根层级的文件", () => {
      // 构建模拟的文件结构
      const rootFileData: FileData = {
        path: "root",
        type: "dir",
        children: [
          {
            path: "App.jsx",
            type: "file",
            children: [],
            describe: {
              fileName: "App",
              fileExtension: "jsx",
              fileContent: "App Content",
            },
          },
          {
            path: "index.js",
            type: "file",
            children: [],
            describe: {
              fileName: "index",
              fileExtension: "js",
              fileContent: "Index Content",
            },
          },
        ],
        describe: { fileName: "root" },
      };
      const result = getTargetFileData(rootFileData, "App");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("App.jsx");
      expect(result?.describe.fileContent).toBe("App Content");
    });
    it("应该能正确查找嵌套目录中的文件", () => {
      // 构建模拟的嵌套文件结构
      const rootFileData: FileData = {
        path: "root",
        type: "dir",
        children: [
          {
            path: "src",
            type: "dir",
            children: [
              {
                path: "components/Button.jsx",
                type: "file",
                children: [],
                describe: {
                  fileName: "Button",
                  fileExtension: "jsx",
                  fileContent: "Button Component",
                },
              },
              {
                path: "pages",
                type: "dir",
                children: [
                  {
                    path: "pages/Home.jsx",
                    type: "file",
                    children: [],
                    describe: {
                      fileName: "Home",
                      fileExtension: "jsx",
                      fileContent: "Home Page",
                    },
                  },
                ],
                describe: { fileName: "pages" },
              },
            ],
            describe: { fileName: "src" },
          },
        ],
        describe: { fileName: "root" },
      };
      const result = getTargetFileData(rootFileData, "src/pages/Home");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("pages/Home.jsx");
      expect(result?.describe.fileContent).toBe("Home Page");
    });
    it("当文件不存在时应返回null", () => {
      const rootFileData: FileData = {
        path: "root",
        type: "dir",
        children: [
          {
            path: "src",
            type: "dir",
            children: [
              {
                path: "App.jsx",
                type: "file",
                children: [],
                describe: {
                  fileName: "App",
                  fileExtension: "jsx",
                  fileContent: "App Content",
                },
              },
            ],
            describe: { fileName: "src" },
          },
        ],
        describe: { fileName: "root" },
      };
      const result = getTargetFileData(rootFileData, "src/NotExist");
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("文件路径有误或文件不存在");
    });
    it("当目录不存在时应返回null", () => {
      const rootFileData: FileData = {
        path: "root",
        type: "dir",
        children: [
          {
            path: "src",
            type: "dir",
            children: [],
            describe: { fileName: "src" },
          },
        ],
        describe: { fileName: "root" },
      };
      const result = getTargetFileData(rootFileData, "invalid/path");
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("文件路径有误或文件不存在");
    });
  });
  describe("replaceDynamicSlot 函数测试", () => {
    it("应该正确替换单个占位符", () => {
      const inputString = "import React from 'react';\n/* slot: component */\nexport default App;";
      const slotName = "component";
      const replacement = "function App() {\n  return <div>Hello World</div>;\n}";
      const result = replaceDynamicSlot(inputString, slotName, replacement);
      expect(result).toBe(
        "import React from 'react';\nfunction App() {\n  return <div>Hello World</div>;\n}\nexport default App;",
      );
    });
    it("应该正确替换多个相同的占位符", () => {
      const inputString =
        "/* slot: import */\n\nfunction App() {\n  /* slot: import */\n  return <div />\n}";
      const slotName = "import";
      const replacement = "// Replaced Content";
      const result = replaceDynamicSlot(inputString, slotName, replacement);
      expect(result).toBe(
        "// Replaced Content\n\nfunction App() {\n  // Replaced Content\n  return <div />\n}",
      );
    });
    it("当占位符不存在时应保持原字符串不变", () => {
      const inputString = "import React from 'react';\nfunction App() {}\nexport default App;";
      const slotName = "nonexistent";
      const replacement = "// This should not appear";
      const result = replaceDynamicSlot(inputString, slotName, replacement);
      expect(result).toBe(inputString);
    });
    it("应该能处理特殊字符的占位符名称", () => {
      const inputString = "/* slot: store-config */\nconst store = {};";
      const slotName = "store-config";
      const replacement = "const store = createStore(reducer);";
      const result = replaceDynamicSlot(inputString, slotName, replacement);
      expect(result).toBe("const store = createStore(reducer);\nconst store = {};");
    });
    it("应该忽略不匹配的slot格式", () => {
      const inputString = "/* not a slot: component */\n/* slot:invalid */";
      const slotName = "component";
      const replacement = "// Replacement";
      const result = replaceDynamicSlot(inputString, slotName, replacement);
      expect(result).toBe(inputString);
    });
  });
});
