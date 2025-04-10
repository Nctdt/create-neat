import path from "path";
import fs from "fs";
import type GeneratorAPI from "@src/models/GeneratorAPI.js";
import { pluginToTemplateProtocol } from "@src/configs/protocol.js";

// ESM 环境下的路径处理
const __dirname = import.meta.dirname;

export default (generatorAPI: GeneratorAPI) => {
  // 1. 添加 MobX 核心依赖
  generatorAPI.extendPackage({
    devDependencies: {
      mobx: "^6.6.4",
      "mobx-react-lite": "^3.2.2",
    },
  });

  // 2. 协议化配置注入
  generatorAPI.protocolGenerate({
    // 导入声明协议
    [pluginToTemplateProtocol.INSERT_IMPORT_PROTOCOL]: {
      filePath: "src/App.tsx",
      imports: [
        {
          name: "{ observer }",
          source: "mobx-react-lite",
          isTypeOnly: false,
        },
        {
          name: "store",
          source: "@/stores/counter",
          isTypeOnly: false,
        },
      ],
    },

    // 导出包装协议
    [pluginToTemplateProtocol.UPDATE_EXPORT_CONTENT_PROTOCOL]: {
      filePath: "src/App.tsx",
      exportType: "named",
      exportName: "ObserverApp",
      wrapper: "observer",
    },

    // 插槽内容注入协议
    [pluginToTemplateProtocol.SLOT_CONTENT_PROTOCOL]: {
      filePath: "src/stores/counter.ts",
      slotMarker: "/* observable-properties */",
      content: `number = 0; // MobX observable value`,
    },
  });

  // 3. 生成 Store 模板文件
  const storeTemplate = `import { makeAutoObservable } from 'mobx';

class CounterStore {
  /* observable-properties */

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.number += 1;
  }
}

export const store = new CounterStore();`;
  fs.writeFileSync(path.join(__dirname, "../../template/src/stores/counter.ts"), storeTemplate);
};
