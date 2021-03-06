首先Koa和Express是的原班人马开发的，所以在用法上会有很多一样的地方，但是Koa相对于Express显得轻了很多。到底主要轻在了那里，我们起一个服务看看就知道了。   
```
npm install koa --save
```      
先安装一下    
起个国际惯例的**hello world**    
```JavaScript
const Koa = require('koa');
const app = new Koa();

app.use((ctx,next) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```    
打开浏览器，访问`localhost:3000`    
![init](../pic/koa1.png)    
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
细心的人应该已经看出来了，koa的中间件就参数方面也与express有一些出入    
```javascript
//express 的中间件
app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});
```    
可以看到express的中间件的回调会有3个参数`req`, `res`以及`next`   
```javascript
//koa 的中间件
app.use((ctx,next) => {
  ctx.body = 'Hello World';
});
```    
而到了koa减少到只有ctx 和next,因为koa把Node中的request 和response 对象都封装到了ctx.req和ctx.res里，同时koa自身也封装了request 和response,可以通过ctx.request和ctx.response来访问他们的API，也可以直接具体方法在ctx下的别名去调用具体可以看[官方文档](https://koa.bootcss.com/)上的用法      
不过koa和express中间件的处理的最大差异并不是参数上，而是二者在**对异步的处理**上    
举一个简单的例子    
```javascript
let express = require('express');

let app = express();
app.use((req,res,next) => {
  console.log(1);
  next();
  console.log(2);
})
app.use((req, res, next) => {
  console.log(3);
  next();
  console.log(4);
})
app.use((req, res, next) => {
  console.log(5);
  next();
  console.log(6);
})
app.listen(3000);
```    
用koa运行的话只要把`use`的参数修改一下就可以了    
```JavaScript
//改成下面这样，这里偷个懒
app.use( (ctx,next)=>{
  console.log(1);
  next();
  console.log(2);
});
//省略其他相同代码
```
这段代码最后的输出结果两个都是一样    
```JavaScript
1
3
5
6
4
2
```   
为什么会这样输出?    
其实上面的代码等同于下面这样    
```JavaScript
let Koa = require('koa');

let app = new Koa();
app.use((ctx,next) => {
  console.log(1);
  (ctx,next) => {
    console.log(3);
    (ctx, next) => {
      console.log(5);
      next();
      console.log(6);
    }
    console.log(4);
  }
  console.log(2);
})
app.listen(3000)
```   
在前一个中间件中调用`next()`就相当于直接调用下一个中间件，直到最后一个中间件。所以为什么会是`1 3 5 6 4 2` 应该一样就看出来了    
既然express 和koa出来的结果都是一样的，那么不是没有区别了吗？    
当然不是，重头戏在异步    
```JavaScript
//省略引入
function log() {
  return new Promise((resolve,reject)=>{
    setTimeout(() => {
      resolve('123');
    }, 1000);
  })
}
app.use( async(ctx,next)=>{
  console.log(1);
  await next(); 
  console.log(2);
});
app.use(async (ctx, next) => {
  console.log(3);
  let r = await log();
  console.log(r);
  next();
  console.log(4);
});
app.use((ctx, next) => {
  console.log(5);
  next();
  console.log(6);
})
//省略监听
```    
上面这部分代码用express和koa分别去执行(express执行的时候参数ctx需要换成req,res)    
得到的结果分别如下：    
### express：    
```JavaScript
1
3
2
123
5
6
4
```   
### koa:   
```JavaScript
1
3
123
5
6
4
2
```   
一个明显的差异，**koa的async/await是生效的**，而**express的async/await却不生效**,直接跳出过执行了`console.log(2)`,并没有去等待异步的执行。    
为什么会造成这样的差异，还是要从express和koa的`next`的执行思路入手    
接下去简单的缕一缕，先把代码放飞一下自我改成如下样子:    
```JavaScript
//把原先的express用空函数代替
function app() {} 
//存放中间件的回调函数
app.routes = []
//提供use方法模拟最基本的功能
app.use = function(fn) {
  //每次调用use就把传入的回调函数推到routes数组尾部
  app.routes.push(fn)
}
//异步log
function log() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('123')
    }, 1000)
  })
}
//开始调用
app.use(async (req, res, next) => {
  console.log(1)
  await next()
  console.log(2)
})
app.use(async (req, res, next) => {
  console.log(3)
  let r = await log()
  console.log(r)
  next()
  console.log(4)
})
app.use((req, res, next) => {
  console.log(5)
  next()
  console.log(6)
})

let index = 0
//这个next只有最最基础的功能
function next() {
  // 最后一个next调用之后就直接跳出了递归
  if (app.routes.length === index) return
  //取出routes里当前index的中间件回调，然后把index + 1
  let route = app.routes[index++]
  //执行这个中间件回调，为了方便这里req,res就都传空对象了，最后把next自己再传入
  route({}, {}, () => next())
}
//执行next
next()
```    
运行一下代码，得到了和express允许相同的结果：`1 3 2 123 5 6 4`     
可以来分析一下为什么会造成await不等待，首先await会去等待的是一个Promise或者async函数，那么我们这个next()执行后并没有返回值，所以 await next() 的话，相当与**await undefined**。嗯哼，undefined 还await个蛋呀，当然过啦。那么要让express实现和koa一样的异步处理也很简单，对next函数稍加修改    
```JavaScript
//重点修改next方法
function next() {
  if (app.routes.length === index) return
  let route = app.routes[index++]
  // 只要把中间件的回调函数return出去就可以了
  return route({}, {}, () => next())
}
```    
执行一下,喜得：    
```javascript
1
3
123
5
6
4
2
```    
那么原因是什么，加了一个return就完事了？   
首先看一下第一次return的是一个什么东西    
```javascript
app.use(async (req, res, next) => {
  console.log(1)
  await next()
  console.log(2)
})
```    
原先不加return的时候这段代码的next 执行后没有返回值所以默认返回的是undefined，加了return之后这个next的返回是：    
```javascript
async (req, res, next) => {
  console.log(3)
  let r = await log()
  console.log(r)
  next()
  console.log(4)
}
```   
是一个**async/await**函数，这样一来就成了.    
## 总结   
目前理解还是比较粗浅，后续会进行深入的使用和分析
