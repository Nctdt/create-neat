import fse from "fs-extra";
import path from "path";

const dirname = import.meta.dirname;
const join = (p) => path.join(dirname, p);
/** 需要复制的文件列表 */
const copyfileList = [
  "template/webpack.config.js",
  "template/README.md",
  "template/README-EN.md",
  "template/gitignore",
];

fse.ensureDirSync(join("dist/template"));

for (const copyfilePath of copyfileList) {
  fse.copyFileSync(join(copyfilePath), join(`dist/${copyfilePath}`));
}

/**
 * 复制 template/template-xxx/generator/template 到
 *  dist/template/template-xxx/generator/template
 * @todo 目前用 tsc 无法自动打包这部分 之后可改用其他打包工具完成这部分操作
 */
const templateDirs = fse
  .readdirSync(join("template"), { withFileTypes: true })
  .filter((dir) => dir.isDirectory() && dir.name.startsWith("template"))
  .map((dir) => ({
    originPath: path.join(dir.parentPath, dir.name, "generator/template"),
    distPath: path.join(dir.parentPath, "../dist/template", dir.name, "generator/template"),
  }));

for (const templateDir of templateDirs) {
  fse.copySync(templateDir.originPath, templateDir.distPath);
}
