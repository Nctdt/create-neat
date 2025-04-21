import { pluginToTemplateProtocol } from "@src/configs/protocol.js";

// 如果需要，可以为 generatorAPI 添加类型
interface GeneratorAPI {
  extendPackage: (packageConfig: Record<string, any>) => void;
  protocolGenerate: (protocolConfig: Record<string, any>) => void;
}

export default (generatorAPI: GeneratorAPI) => {
  generatorAPI.extendPackage({
    dependencies: {
      pinia: "^2.2.2",
    },
  });

  generatorAPI.protocolGenerate({
    [pluginToTemplateProtocol.INSERT_IMPORT_PROTOCOL]: {
      params: {
        imports: [
          {
            dir: "src/main",
            modules: [
              {
                name: "pinia",
                from: "./store",
              },
            ],
          },
        ],
        astOptions: {
          parserOptions: { sourceType: "module", plugins: ["typescript"] },
        },
      },
    },
    [pluginToTemplateProtocol.SLOT_CONTENT_PROTOCOL]: {
      params: {
        slotConfig: [
          {
            url: "src/main",
            slotName: "use-pinia-slot",
            slotContent: "app.use(pinia);",
          },
        ],
      },
    },
  });
};
