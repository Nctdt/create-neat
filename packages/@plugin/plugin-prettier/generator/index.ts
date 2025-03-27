interface GeneratorAPI {
  extendPackage: (packageConfig: Record<string, any>) => void;
  protocolGenerate: (protocolConfig: Record<string, any>) => void;
}

// 主函数实现
const configGenerator = (generatorAPI: GeneratorAPI) => {
  generatorAPI.extendPackage({
    prettier: {
      tabWidth: 2, // 每个缩进级别的空格数
      printWidth: 80, // 每行最大字符数
      useTabs: false, // 使用空格代替制表符
      semi: true, // 语句末尾分号
      singleQuote: true, // 使用单引号
    },

    devDependencies: {
      prettier: "^3.1.0", // 开发依赖版本
    },
    scripts: {
      format: 'prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"', // 格式化脚本
    },
  });
};

export default configGenerator;
