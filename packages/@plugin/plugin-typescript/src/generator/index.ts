// 类型定义
interface GeneratorAPI {
  extendPackage: (config: object) => void;
  protocolGenerate: (config: object) => void;
}

const templateToBuildToolProtocol = {
  ADD_CONFIG: "ADD_CONFIG",
  ENTRY_FILE: "ENTRY_FILE",
  UPDATE_EXPORT_CONTENT_PROTOCOL: "UPDATE_EXPORT_CONTENT_PROTOCOL",
  INSERT_IMPORT_PROTOCOL: "INSERT_IMPORT_PROTOCOL",
  SLOT_CONTENT_PROTOCOL: "SLOT_CONTENT_PROTOCOL",
};

const typescriptPlugin = (generatorAPI: GeneratorAPI) => {
  generatorAPI.extendPackage({
    devDependencies: {
      typescript: "~5.4.0",
      "@types/node": "^20.11.28",
    },
  });
  generatorAPI.protocolGenerate({
    [templateToBuildToolProtocol.ADD_CONFIG]: {
      params: {
        content: "Specil plugin",
      },
      priority: 1,
    },
  });
};

export default typescriptPlugin;
