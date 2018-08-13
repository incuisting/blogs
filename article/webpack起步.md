## 什么是webpack   
webpack可以被看成是一个模块打包机:它主要做的事情就是分析你的项目结构，把JavaScript模块和一些浏览器不能直接运行的如Scss,TypeScript这类拓展性语言，打包和转化成浏览器可以使用的格式。    
webpack构建一般会对代码做如下内容：    
- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
- 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
- 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。    
### 一档起步    
webpack核心概念一览：    
- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。    
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。     

webpack的常规流程一般就是这样:   
<>   


初始化一个项目：   
```javascript
mkdir webpackBegin
cd webpackBegin
npm init -y
```   
把webpack安上：   
```javascript
npm install webpack webpack-cli -D
```   
创建webpack的配置文件和相关的文件：   
```javascript
mkdir src
cd src
touch index.js
touch hello.js
touch webpack.config.js
```   
编辑webpack.config.js添加基础的配置：   
```javascript
const path = require('path')
module.export = {
    entry:'./src/index.js',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'bundle.js'
    }
}
```


