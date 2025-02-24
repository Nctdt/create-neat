import { templateToBuildToolProtocol } from "../../../src/configs/protocol.js";
import TemplateAPI from "../../../src/models/TemplateAPI.js";

export default (templateAPI: TemplateAPI) => {
  templateAPI.extendPackage({
    dependencies: {
      vue: "^3.2.47",
    },
    devDependencies: {
      "vue-template-compiler": "^2.7.16",
    },
  });

  templateAPI.protocolGenerate({
    [templateToBuildToolProtocol.ADD_CONFIG]: {
      params: {
        content: 'Specil plugin',
      },
      priority: 1,
    },
  })
};
