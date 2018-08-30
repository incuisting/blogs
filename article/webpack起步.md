## 什么是 webpack

webpack 可以被看成是一个模块打包机:它主要做的事情就是分析你的项目结构，把 JavaScript 模块和一些浏览器不能直接运行的如 Scss,TypeScript 这类拓展性语言，打包和转化成浏览器可以使用的格式。  
webpack 构建一般会对代码做如下内容：

- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
- 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
- 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。

### 一档起步

webpack 核心概念一览：

- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。

webpack 的常规流程一般就是这样:  
<>

初始化一个项目：

```javascript
mkdir webpackBegin
cd webpackBegin
npm init -y
```

把 webpack 安上：

```javascript
npm install webpack webpack-cli -D
```

创建 webpack 的配置文件和相关的文件：

```javascript
mkdir src
cd src
touch index.js
touch name.js
touch webpack.config.js
```

编辑 webpack.config.js 添加基础的配置：

```javascript
const path = require('path')
module.export = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
```

编辑 index.js

```javascript
import helloWebpack from './name'
alert(helloWebpack)
```

编辑 hello.js

```javascript
export default (name = 'helloWebpack')
```

编辑 package.json 中的 script 选项

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
编辑 package.json 中的 script 选项

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

安装完毕之后，开始配置 webpack.config.js:

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
- compress 开发服务器是否启动 gzip 等压缩
- port：开发服务器监听的端口

然后编辑 package.json 中的 script 选项

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

然后打开 webapck.config.js:

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
差点忘了在 src 下生成一个 index.html 文件：

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

等在终端看到`Compiled successfully`，打开浏览器，然后访问`localhost8080`,就会看到一个弹出框。那么一切就都成了。html 有了，接下来要配置 css 的打包。

### 对 css 文件加载的支持

在做这个之前，需要明白一个前置知识，那就是 webpack 的 loader。首先把 css 要用到的 loader 先按上。

```javascript
npm install -D css-loader style-loader
```

这两个 loader 的作用：

- css-loader:解析和处理 css 的引入路径，
- style-loader：用来把 css 代码转成 js 代码，在执行的时候会向页面中注入一个 style 标签

#### 什么是 loader？

loader 相当于是一个转化器，它可以让 webpack 把不同的文件转化成统一的文件进行输出。比如 jsx 转成 js，scss 转成 css 等等。

#### loader 的 3 种写法

1. loader

```javascript
//增加一个module参数
module: {
  rules: [
    {
      test: /\.css/,
      loader: ['style-loader', 'css-loader']
    }
  ]
}
```

2. use

```javascript
module: {
        rules: [
            {
                test: /\.css/,
                use:['style-loader','css-loader']
            }
        ]
    },
```

3. use+loader

```javascript
module: {
  rules: [
    {
      test: /\.css/,
      include: path.resolve(__dirname, 'src'),
      exclude: /node_modules/,
      use: [
        {
          loader: 'style-loader',
          options: {
            insertAt: 'top'
          }
        },
        'css-loader'
      ]
    }
  ]
}
```

解释一下上面各类参数的意思：

- test：匹配处理文件的扩展名的正则表达式
- use：loader 名称，就是你要使用模块的名称
- include/exclude:手动指定必须处理的文件夹或屏蔽不需要处理的文件夹
- query：为 loaders 提供额外的设置选项

我们使用上述第三种方式，简单配置一下，打开 webpack.config.js:

```javascript
  module:{
    rules:[
      {
        test:/\.css$/,
        use:['style-loader','css-loader'],
        exclude:/node_modules/,
        include:path.resolve(__dirname,'src')
      }
    ]
  },
```

然后在 src 下创建一个 index.css

```css
body {
  color: red;
}
```

在 index.html 添加一些文字

```html
<body>
   <div id='root'></div>
</body>
```

编辑 index.js

```javascript
import helloWebpack from './name'
import './index.css'
document.querySelector('#root').innerHTML = helloWebpack
```

现在打开`localhost:8080` 看一下效果,可以看到红色的字了  
简要的讲了一下 loader 之后，在回过头来看一些 plugin

### plugin

先前为了能自动产出 html，使用过一个 html-webpack-plugin 的插件，当时只是简单的配置了一下，现在稍微深入一点讲一件，webpack 中的 plugin 是什么。  
首先在`webpack`的构建流程中，`plugin`的定位是用于处理一些 loader 职责之外的事情。
loader 前面说过主要负责模块代码转换的工作，那么除此之外的其他任何工作都可以交由`plugin`来完成.  
就拿 html-webpack-plugin 来说，它就可以自动根据 html 模板去生产 html，并且把编译好的 js 插入到里面。先去对这个插件做了简单的配置，但是它引入的资源文件名字都是固定不会变的，会引起浏览器的缓存。不过可以该插件可以通过配置避免这个问题。

```JavaScript
plugins: [
        new HtmlWebpackPlugin({
        hash: true,
        template: './src/index.html',
        filename:'index.html'
  })]
```

这样一来，html 引入的 js 文件名字里每次都会自动加入一段 hash 值。浏览器就不会因为文件民相同而导致缓存了。  
图片在前段中也是很重要的一个环节，所以接下去配置 webpack 对图片的支持。

### 图片

在 webpack 中使用`file-loader`和`url-loader`这两个 loader 来处理图片。其中 `file-loader`解决 CSS 等文件中的引入图片路径问题。
`url-loader` 则是当图片小于 limit 的时候会把图片 BASE64 编码，大于 limit 参数的时候还是使用`file-loader` 进行拷贝。

#### 先解决在 JS 中引入图片的问题

先去整张图，我这里扒了一张 google 的 logo 放在 src 下的 images 文件夹  
在 index.js 文件中引入图片：

```javascript
// 省略部分代码
import google from './images/google.png'
let img = new Image()
img.src = google
document.body.appendChild(img)
```

配置 webpack.config.js

```javascript
// ...省略
module: {
  rulues: [
    //...省略
    {
      test: /\.(jpg|png|bmp|gif|svg|ttf|woff|woff2|eot)/,
      use: [
        {
          loader: 'url-loader',
          options: {
            //小于这个大小的图片会变成base64 格式
            limit: 4096
          }
        }
      ]
    }
  ]
}
```

打开页面看一看。是否出现了一个 google 的 logo.  
既然已经配置了好了，那么也试一下用 css 的方式引入图片是否也同样可以。  
编辑 index.html:

```html
<body>
    <div id='root'></div>
    <div class='img'></div>
</body>
```

编辑 index.css:

```css
.img {
  width: 271px;
  height: 92px;
  background-image: url(./images/google.png);
}
```

在打开浏览器，会发现又多了一个 google 的 logo。
现在的 css 还在通过 js 插入到 html 的 header 里面的。接下去配置 webpack 让 css 单独被引入进来。

### 分离 css

要做到分离 css，需要用到一个插件。`mini-css-extract-plugin`.
首先还是按照管理安装一下：

```shell
npm install --save-dev mini-css-extract-plugin
```

安装完毕之后，更新 webpack.config.js 的配置：

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module:{
  rule:[
    {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      }
      //...省略没有变动代码
  ]
},
plugins:[
  //...省略没有变动代码
new MiniCssExtractPlugin({
      filename: '[name].css',//打包入口文件
      chunkFilename:'[id].css'//用来打包import('module')方法中引入的模块
    })
]
```

重新把`npm run dev`跑一下。用审查元素可以明显的看到 css 是通过 link 标签引入的。  
把 css 被单独引入之后，就是压缩 css 和 js 了。  
这里我们需要用到两个插件来做这件事情。`uglifyjs-webpack-plugin`和`optimize-css-assets-webpack-plugin`  
惯例安装一下插件：

```shell
npm install -D uglifyjs-webpack-plugin optimize-css-assets-webpack-plugin
```

再去更新 webpack.config.js:

```javascript
const UglifyJSplugin = require('uglifyjs-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
//...省略没有变动的代码
 optimization: {
    minimizer: [
      new UglifyJSplugin({
        cache: true, //启用缓存
        parallel: true, // 使用多进程运行改进编译速度
        sourceMap: true //生成sourceMap映射文件
      }),
      new OptimizeCssAssetsWebpackPlugin({})
    ]
  },
```

顺带说一下`optimization`选项是 webpack4 新增加的。  
配置好了，`npm run build` 跑一下试一下看看，看看 dist 目录下打包出来的 css 文件是不是都变到了一行。
再接下去就是把 css 和 images 打包后单独放到一个文件夹。  
编辑 webpack.config.js 对下列熟悉做修改:

```javascript
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    // ......
    rules: [
      {
        test: /\.(jpg|png|bmp|gif|svg|ttf|woff|woff2|eot)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              //小于这个大小的图片会变成base64 格式
              limit: 4096,
              outputPath: 'images',
              publicPath: '/images'
            }
          }
        ]
      }
    ]
  },
  //......
  plugins: [
    //.....
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      hunkFilename: 'css/[id].css'
    })
  ]
```

修改完之后，`npm run build` 就可以发现打包出来的文件已经把 css 和 images 单独放到了一个文件夹里。  
这里还有一个关于图片配置补充一下，就是在处理在 html 中引入的图片。处理这件事情主要依赖于一个 loader。`html-withing-loader`
先安装一下：

```shell
npm install -D html-withimg-loader
```

编辑 html 文件，增加一 img 标签引入图片：

```html
<img src="./images/google.png"/>
```

配置 webpack.config.js,增加一个 loader 处理:

```javascript:
module: {
  rules: [
    //......
    {
      test: /\.(html|htm)$/,
      use: 'html-withimg-loader'
    }
  ]
}
```

再运行`npm run dev` 打开浏览器就可以看到 3 张 google 的 logo 了.

### 编译 less 和 sass

安装 less 和 sass 以及 loader：

```shell
npm install -D less less-loader node-sass sass-loader
```

配置 webpack.config.js,增加新的 loader：

```javscript
{
        test: /\.less/,
        include: path.resolve(__dirname,'src'),
        exclude: /node_modules/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
        },'css-loader','less-loader']
    },
    {
        test: /\.scss/,
        include: path.resolve(__dirname,'src'),
        exclude: /node_modules/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
        },'css-loader','sass-loader']
    },
```

创建用于测试的 css 和 less：
src/less.js:

```less
@color: orange;
.less-container {
  color: @color;
}
```

src/sass.scss:

```scss
$color: green;
.sass-container {
  color: green;
}
```

在 index.js 中引入一下:

```js
import './less.less'
import './sass.scss'
```

在 index.html 中加入测试 dom:

```html
    <div class="less-container">less</div>
    <div class="sass-container">sass</div>
```

`npm run dev` 查看一下,可以看到浏览器里 less 是橙色,sass 是绿色

### 处理 css 属性前缀

为了浏览器的兼容性，有时候我们必须加入-webkit,-ms,-o,-moz 这些前缀,当然可能手动加,这辈子是不可能手动加的.  
安装

```
npm install -D postcss-loader autoprefixer
```

在根目录下创建 postcss.config.js:

```js
module.exports = {
  plugins: [require('autoprefixer')]
}
```

配置 webapck.config.js 修改 css 的 loader:

```javascript
    {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader'
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      },
```

修改 index.css,添加一个需要被添加前缀的属性:

```css
.img {
  width: 271px;
  height: 92px;
  background-image: url(./images/google.png);
  transform: rotate(10deg);
  /* 添加 transform 该属性被加前缀 */
}
```

`npm run dev` 浏览器中审查元素,可以发现 transform 已经被加了前缀

### 转义 ES6/ES7/JSX

需要支持这项功能，需要引入很多 loader 和 plugin。所以先安一波。

```shell
npm install -D babel-core babel-loader babel-preset-env babel-preset-stage-0 babel-preset-react babel-plugin-transform-decorators-legacy
```

配置 webpack.config.js,增加一个 loader：

```js
{
    test: /\.jsx?$/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ["env","stage-0","react"],
            plugins:["transform-decorators-legacy"]
        }
    },
    include: path.join(__dirname,'src'),
    exclude:/node_modules/
}
```

### 调试打包后的代码

webpack 通过配置可以自动给我们 source maps 文件，map 文件是一种对应编译文件和源文件的方法

- `source-map` 把映射文件生成到单独的文件，最完整最慢
- `cheap-module-source-map` 在一个单独的文件中产生一个不带列映射的 Map
- `eval-source-map` 使用 eval 打包源文件模块,在同一个文件中生成完整 sourcemap
- `cheap-module-eval-source-map` sourcemap 和打包后的 JS 同行显示，没有映射列
  配置 webpack.config.js,添加 devtool 属性：

```js
devtool: 'eval-source-map'
```

### watch

当代码发生修改后可以自动重新编译

```js
watch: true,
watchOptions: {
    ignored: /node_modules/, //忽略不用监听变更的目录
    poll:1000, //每秒询问的文件变更的次数
    aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫秒内重复保存不打包
}
```

- `webpack`定时获取文件的更新时间，并跟上次保存的时间进行比对，不一致就表示发生了变化,`poll`就用来配置每秒问多少次
- 当检测文件不再发生变化，会先缓存起来，等待一段时间后之后再通知监听者，这个等待时间通过`aggregateTimeout`配置,类似于节流函数的功能
- `webpack`只会监听`entry`依赖的文件
- 我们需要尽可能减少需要监听的文件数量和检查频率，当然频率的降低会导致灵敏度下降

### 编译后文件 banner

在 webpack.config.js 的 plugins 里加入下面这个插件

```js
const webpack = require('webpack')
plugins: [
  //....
  new webpack.BannerPlugin('webpackTest')
]
```

### 拷贝静态文件

有时项目中没有引用的文件(比如一些文档，设计稿等等)也需要打包到目标目录，这里通过`copy-webpack-plugin`实现。
安装

```shell
npm install -D copy-webpack-plugin
```

配置 webpack.config.js,添加插件：

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')
plugins: [
  //....
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, 'src/assets'), //静态资源目录源地址
      to: path.resolve(__dirname, 'dist/assets') //目标地址，相对于output的path目录
    }
  ])
]
```

## 总结   
基础一点的就先就介绍到这里，后续再记录一些稍微高级一点的用法。
