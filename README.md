## harmonyos-jsx
使用JSX编写鸿蒙原生应用！ **本项目仍然在持续更新中，谨慎使用在生产环境**

![jsx-show.gif](./static/jsx-show.gif)

### Getting Started
1. 首先全局安装 `harmonyos-jsx`。 安装成功之后会提供 `hsx`命令，可通过`hsx --version` 查看是否安装成功。
2. 参考HarmonyOS[开发文档](https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/start-with-ets-stage-0000001477980905-V3) 创建初始化项目
3. 进入项目目录，执行如下脚本`hsx`， 如果是**首次执行**此命令将会在`ets`目录下创建以下文件
    * pages-tsx 目录： 后续的tsx 源码目录
    * arks-global.d.ts 
    * tsconfig.json

4. 使用vscode 或其他你喜欢的IDE，打开项目目录
5. 在`pages-tsx`目录 创建和编写你的tsx文件即可。 `hsx`命令会实时把你的`tsx`文件编译为等效的`ArkTS`版本
![vscode-editor](./static/vscode-editor.png)

### TODO
- [ ] support style prop
- [ ] 属性返回JSX
- [ ] ArkTS内置组件 TS描述完善
- [ ] 友好的转化报错信息
- [ ] performance
- [ ] other


### Q&A
1. 是否支持 .jsx 文件 ？
<br>否，只会处理tsx文件。


### License
MIT License

Copyright (c) harmonyos-jsx






