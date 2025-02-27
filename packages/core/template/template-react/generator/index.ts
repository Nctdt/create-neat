import { templateToBuildToolProtocol } from "../../../src/configs/protocol.js";
import TemplateAPI from "../../../src/models/TemplateAPI.js";

export default (templateAPI: TemplateAPI) => {
  templateAPI.extendPackage({
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {},
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
