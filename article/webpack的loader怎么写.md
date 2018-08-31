loader 的本质是一个函数，该函数在webpack遇到特定的资源转换的时候调用。
自己写的loader 引入的方式
单个loader的时候
```js
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: path.resolve('path/to/loader.js'), 
            options: {/* ... */}
          }
        ]
      }
    ]
  }
};
```

多个loader的时候
```js
module.exports = {
  //...
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'loaders')
    ]
  }
};
```
通过 resolveLoader 来配置 获取loader的路径
简单的使用
写一个简单的直接return 出来的loader
多个loader的链式使用

loader 的原则
其中的工具库的作用

介绍loader几个主要的api
pitch是一个难点
loader实战 一到两个