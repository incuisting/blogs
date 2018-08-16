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
touch name.js
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
编辑index.js
```javascript
import helloWebpack from './name'
alert(helloWebpack)
```
编辑hello.js
```javascript
export default (name = 'helloWebpack')
```
编辑package.json中的script选项
```javascript
"scripts": {
    "build": "webpack"
  },
```   
打开了终端:    
```shell
npm run build
```   
经过一顿编译之后，就会发现在`dist`目录下多了一个`bundel.js`的打包文件。不过打开来，会发现它是一个经过压缩的文件。然后把镜头转到终端。有如下一段文字    
```
WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/concepts/mode/
```    
意思就是，你没有加`mode`选项，所以`webpack`默认给你打包成**生产模式**了。也就是代码自动给你压缩了。如果要不压缩，那就加把`mode` 选项设置成 `development`。   
编辑package.json中的script选项
```javascript
"scripts": {
    "build": "webpack --mode development"
  },
```   
然后再打包的代码就不是压缩代码了。    
接下去为这个项目配置，本地开发服务器   
### 本地开发服务器   
首先安装一下：   
```javascript
npm install -D webpack-dev-server 
```   
安装完毕之后，开始配置webpack.config.js:   
```javascript
 devServer:{
        contentBase:path.resolve(__dirname,'dist'),
        host:'localhost',
        compress:true,
        port:8080
 }
```    
在配置文件中添加以上配置，各项配置具体参数意思如下：   
- contentBase 配置开发服务运行时的文件根目录
- host：开发服务器监听的主机地址
- compress 开发服务器是否启动gzip等压缩
- port：开发服务器监听的端口

然后编辑package.json中的script选项
```javascript
"scripts": {
    "build": "webpack --mode production",
    "dev": "webpack-dev-server --mode development"
  }
```    
其实到着一部，就已经可以`npm run dev`启动本地服务了，不过这里还是要多做一步，把`HtmlWebpackPlugin`插件也配置起来。这样等等就是可以直接看到页面了。   
首先还是要安装一下：   
```
npm install -D html-webpack-plugin
```
然后打开webapck.config.js:
```javascript
//最上面引入模块
const HtmlWebpackPlugin = require('html-webpack-plugin')
//编辑module.exports = {}
module.exports = {
    //...省略前部分
     plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html'
    })
  ]
```
为配置文件添加了`plugins`参数，插件的添加方式是在数据里`new`一下然后传入配置。这里的`template`就是模板的意思，`webpack`就会根据这个`html`文件的格式去插入编译好的`js文件`。`filename`就是最后这个`html`编译好输出的名字。   
差点忘了在src下生成一个index.html文件：   
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```
好了现在万事俱备，打开终端：   
```shell
npm run dev
```  
等在终端看到`Compiled successfully`，打开浏览器，然后访问`localhost8080`,就会看到一个弹出框。那么一切就都成了。html有了，接下来要配置css的打包。   
### 对css文件加载的支持   
在做这个之前，需要明白一个前置知识，那就是webpack 的loader。首先把css要用到的loader先按上。
```javascript
npm install -D css-loader style-loader
```   
#### 什么是loader？   
loader相当于是一个转化器，它可以让webpack把不同的文件转化成统一的文件进行输出。比如jsx转成js，scss转成css等等。   
#### loader的3中写法   
1. loader 
```javascript
 
```
