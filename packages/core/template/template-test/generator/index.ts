import TemplateAPI from "../../../src/models/TemplateAPI.js";

export default (templateAPI: TemplateAPI) => {
  templateAPI.extendPackage({
    dependencies: {},
    devDependencies: {},
  });
};
