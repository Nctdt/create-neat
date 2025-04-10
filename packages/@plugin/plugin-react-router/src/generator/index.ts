// 采用 ES Module 导入方式
import { pluginToTemplateProtocol } from "@src/configs/protocol.js";

interface GeneratorAPI {
  extendPackage: (config: object) => void;
  protocolGenerate: (config: object) => void;
}

const routerPlugin = (generatorAPI: GeneratorAPI) => {
  generatorAPI.extendPackage({
    dependencies: {
      "react-router-dom": "^6.0.0",
    },
  });

  generatorAPI.protocolGenerate({
    [pluginToTemplateProtocol.INSERT_IMPORT_PROTOCOL]: {
      params: {
        imports: [
          {
            dir: "src/App",
            modules: [
              {
                name: "{ BrowserRouter as Router, Switch, Route }",
                from: "react-router-dom",
              },
            ],
          },
        ],
        astOptions: {
          parserOptions: {
            sourceType: "module",
            plugins: ["typescript", "jsx"] as const, // 使用 const 断言
          },
        },
      },
    },
    [pluginToTemplateProtocol.SLOT_CONTENT_PROTOCOL]: {
      params: {
        slotConfig: [
          {
            url: "src/App",
            slotName: "router-start-slot",
            slotContent: "<Router>",
          },
          {
            url: "src/App",
            slotName: "router-end-slot",
            slotContent: "</Router>",
          },
        ],
      },
    },
  });
};

export default routerPlugin;
