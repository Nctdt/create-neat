// 类型定义
interface GeneratorAPI {
  extendPackage: (config: object) => void;
  protocolGenerate: (config: object) => void;
}

const typescriptPlugin = (generatorAPI: GeneratorAPI) => {
  generatorAPI.extendPackage({
    devDependencies: {
      typescript: "~5.4.0",
      "@types/node": "^20.11.28",
    },
  });
};

export default typescriptPlugin;
