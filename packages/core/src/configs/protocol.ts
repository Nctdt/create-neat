/** 通用协议常量，定义了跨不同工具和框架交互的协议类型。*/
const globalProtocol = {
  /** 入口文件配置，例如引入全局的less、scss文件。 */
  ENTRY_FILE: "ENTRY_FILE",
  /** 更改文件导出的内容。 */
  UPDATE_EXPORT_CONTENT_PROTOCOL: "UPDATE_EXPORT_CONTENT_PROTOCOL",
  /** 向文件插入import语句。 */
  INSERT_IMPORT_PROTOCOL: "INSERT_IMPORT_PROTOCOL",
  /** 替换文件中对应slot的内容。 */
  SLOT_CONTENT_PROTOCOL: "SLOT_CONTENT_PROTOCOL",
} as const;

/** 插件对框架的协议。 */
const pluginToTemplateProtocol = {
  ...globalProtocol,
  /** 处理样式协议，如：less、scss。 */
  PROCESS_STYLE_PLUGIN: "PROCESS_STYLE_PLUGIN",
} as const;

/** 插件对构建工具的协议 */
const pluginToBuildToolProtocol = {
  ...globalProtocol,
} as const;

/** 框架对构建工具的协议 */
const templateToBuildToolProtocol = {
  ...globalProtocol,
  /** 根据框架，不同的打包工具需要不同的插件，有些是都需要用的，有些是框架独有的 */
  ADD_CONFIG: "ADD_CONFIG",
} as const;

export {
  globalProtocol,
  pluginToTemplateProtocol,
  pluginToBuildToolProtocol,
  templateToBuildToolProtocol,
};
