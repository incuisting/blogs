首先Koa和Express是的原班人马开发的，所以在用法上会有很多一样的地方，但是Koa相对于Express显得轻了很多。到底主要轻在了那里，我们起一个服务看看就知道了。   
```bash
npm install koa --save
```      
先安装一下    
起个国际惯例的hello world    
```JavaScript
const Koa = require('koa');
const app = new Koa();

app.use((ctx,next) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```    
打开浏览器，访问localhost:3000    
![init]()    
写过express的人应该发现了区别，koa原生没有路由的集成。    
不能像express这样调用`get`直接生成路由
```javascript
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```   
koa如果要使用路由，只能通过`use`来使用中间件完成路由的功能，不过具体如何使用下篇再讲。    
细心的人人应该已经看出来了，koa的中间件就参数方面也与express有一些出入    
```javascript
//express 的中间件
app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});
```    
可以看到express的中间件的回调会有3个参数req res 以及next   
```javascript
//koa 的中间件
app.use((ctx,next) => {
  ctx.body = 'Hello World';
});
```    
而到了koa减少到只有ctx 和next,因为koa把Node中的request 和response 对象都封装到了ctx.req和ctx.res里，同时koa自身也封装了request 和response,可以通过ctx.request和ctx.response来访问他们的API，也可以直接具体方法在ctx下的别名去调用具体可以看[官方文档](https://koa.bootcss.com/)上的用法      
不过koa和express中间件的处理的最大差异并不是参数上，而是二者在对异步的处理上    
举一个简单的例子    
```javascript

```