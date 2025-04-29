/**
 * AST 相关工具方法测试
 *
 * 待测试文件：
 * - /utils/ast/parseAst.ts
 *   - AST 解析相关
 * - /utils/ast/commonAst.ts  已完成
 *   - 通用 AST 工具
 */

import { describe, it, expect } from "vitest";
import { stringLiteral, numericLiteral } from "@babel/types";

import { transformCode } from "../../utils/ast/utils.js";
import {
  createImportDeclaration,
  createNewExpression,
  createCallExpression,
  createObjectProperty,
  exportDefaultDeclarationUtils,
} from "../../utils/ast/commonAst.js";

describe("AST 通用工具测试", () => {
  describe("导入声明测试", () => {
    it("应该正确创建默认导入声明", () => {
      const ast = createImportDeclaration("React", "react");
      const code = transformCode(
        "",
        {
          Program(path) {
            path.node.body.push(ast);
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain('import React from "react"');
    });
  });

  describe("新建表达式测试", () => {
    it("应该正确创建无参数的新建表达式", () => {
      const ast = createNewExpression("Map", []);
      const code = transformCode(
        "",
        {
          Program(path) {
            path.node.body.push({
              type: "ExpressionStatement",
              expression: ast,
            });
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("new Map()");
    });

    it("应该正确创建带参数的新建表达式", () => {
      const ast = createNewExpression("Date", [stringLiteral("2025-03-03")]);
      const code = transformCode(
        "",
        {
          Program(path) {
            path.node.body.push({
              type: "ExpressionStatement",
              expression: ast,
            });
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("new Date");
      expect(code).toContain("2025-03-03");
    });
  });

  describe("函数调用表达式测试", () => {
    it("应该正确创建带参数的函数调用", () => {
      const ast = createCallExpression("legacy", [
        {
          type: "ObjectExpression",
          properties: [
            createObjectProperty("target", {
              type: "ArrayExpression",
              elements: [stringLiteral("> 1%")],
            }),
          ],
        },
      ]);

      const code = transformCode(
        "",
        {
          Program(path) {
            path.node.body.push({
              type: "ExpressionStatement",
              expression: ast,
            });
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("legacy");
      expect(code).toContain('target: ["> 1%"]');
    });
  });

  describe("对象属性测试", () => {
    it("应该正确创建对象属性", () => {
      const ast = createObjectProperty("count", numericLiteral(42));
      const code = transformCode(
        "",
        {
          Program(path) {
            path.node.body.push({
              type: "ExpressionStatement",
              expression: {
                type: "ObjectExpression",
                properties: [ast],
              },
            });
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("count: 42");
    });
  });

  describe("默认导出工具测试", () => {
    it("应该正确包装默认导出声明", () => {
      const source = "export default App;";
      const code = transformCode(
        source,
        {
          ExportDefaultDeclaration(path) {
            exportDefaultDeclarationUtils(path, "Observer");
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("export default Observer(App)");
    });

    it("应该正确处理复杂表达式", () => {
      const source = "const App = class extends Component {}; export default App;";
      const code = transformCode(
        source,
        {
          ExportDefaultDeclaration(path) {
            exportDefaultDeclarationUtils(path, "connect");
          },
        },
        {
          sourceType: "module",
        },
      );

      expect(code).toContain("export default connect(App)");
    });
  });
});
