# 写一个自己的Promise
****
相信 Promise 已经是现代大部分前端处理异步的方式了。但是 Promise 天天都在用，它内部到底做了什么呢？那么就按照[Promises/A+规范](https://promisesaplus.com/)做一个
![home](https://user-gold-cdn.xitu.io/2018/5/20/1637d4b8653387fe?w=375&h=337&f=jpeg&s=15694)

### 实现最基本的功能

首先的 Promise 平时都是 new 出来的，说明它是一个类。那么就先定义一个，名字随意。Promise 接受一个参数，这个参数会是一个函数，接受两个参数 resolve 和 reject。resolve 为成功，reject 为失败。各自也都是一个可以执行的函数。最后不要忘了，还有原型上的 then 方法。  
请看下面这个 git commit  
[初始化](https://github.com/incuisting/fakePromise/commit/68a13666937b9f465e8b6cee97d8ecf803e42c1e)

按照规定，Promise 会有三个状态 ：成功、失败和等待。当在等待的时候可以变成成功或者失败。失败和成功之后不可再改变状态。并且失败会把失败的 reason 传过去，成功会把成功的 value 传过去。  
先定义成功和失败的默认值以及初始状态  
[默认的成功值，默认的失败原因，初始状态](https://github.com/incuisting/fakePromise/commit/cf55dcc1e4a47907ead37e5dfba6b401d67f86c3) (一时手快 pending 拼写错了。。。尴尬。。)

接下去去完善 resolve 和 reject 的功能，他们俩个调用之后首先都是回去判断状态，然后再去改变状态为成功或者失败，以及保存下相应的 reason 或者 value  
[resolve 和 reject 判断 pending，然后改变状态和值](https://github.com/incuisting/fakePromise/commit/55b89b1f4fab84b097c5cdaeee2578835f298589)

下一步把 then 写一下，then 它主要做了什么？接受两个参数，两个参数都是分别为成功的回调的和失败的回调，然后再通过状态去判断是执行失败的还是成功的。  
[定义 then 里面失败或者成功的回调的执行方式](https://github.com/incuisting/fakePromise/commit/d01d78fefe4246000033b8abbbf3e8c3ca5a4ca6)

---

### 增加处理异步的能力

到这一步代码已经可以跑起来了

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise(function(resolve, reject) {
resolve(1)

})
p.then(
(data)=>{
console.log(data)
},
(err)=>{
console.log(err)

}
)
```

但是 resolve 只要被异步调用了，那么就歇菜了。因为异步的代码会在同步代码执行完之后再执行，所以 then 调用的时候状态还是在等待状态，既不是成功也不是失败。所以需要对还是等待态做判断，把成功或者失败的回调先保存起来，等 resolve 或者 reject 的时候再去调用。  
[设置变量存放 then 成功和失败的回调](https://github.com/incuisting/fakePromise/commit/75bae612f8af4d7a4e02d9e544bf82ae86eb62a5)  
[在 pending 态的时候把成功和失败的回调分别放到他们对应的队列里](https://github.com/incuisting/fakePromise/commit/2d30ce99fdfdd0cb045b83df379df79980c6eca6)  
[当成功或者失败的时候再把对应队列里的函数循环执行](https://github.com/incuisting/fakePromise/commit/5f367c77d3d5e4523d87b581a45c1bfeb4aa7068)  
这个时候我们已经可以处理下面这样的情况了

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise((resolve, reject) => {
setTimeout(() => {
resolve('setTimeout');

}, 500);

})
p.then((res) => {
console.log(res);

}, (err) => {
console.log(err);

})
```

---

### 对错误捕获的

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise((resolve, reject) => {
throw new Error('错误')

})
p.then((res) => {
console.log(res);

}, (err) => {
console.log(err);

})
```

接下来处理这种不调用 resolve 也不 reject 直接抛出一个错误的情况  
[直接 throw 一个 error 时的处理](https://github.com/incuisting/fakePromise/commit/ae347391e3e238341dd6f3a9a6eb580f0789ee0d)

---

### 链式调用

原生的 promise 是可以进行链式调用的，要实现这个我们需要在成功或者失败的的时候再返回一个 promise  
[调用 then 之后再返回一个新的 promise](https://github.com/incuisting/fakePromise/commit/34e2f0f3130def50d29ee1eb6e8a0dd1a084937a)

但是当链式调用的时候会有两种情况，一种在 then 里 return 一个普通值，像这样

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise((resolve, reject) => {
resolve(100);

})
p.then((res)=>{
console.log(res); // 100
return 200

},(err)=>{
console.log(err);

}).then((res)=>{
console.log(res); // 200

},(err)=>{
    console.log(err);

})
```

这种情况我们目前的代码时可以处理的，但是还有直接返回一个 promise 的，像这样

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise((resolve, reject) => {
resolve();

})
p.then((res)=>{
return new Promise((resolve,reject)=>{
resolve(100);

})

},(err)=>{
console.log(err);

}).then((res)=>{
console.log(res); //100

},(err)=>{
console.log(err);

})
```

这样的情况我们还处理不了，所以继续加代码  
[首先把返回的值存一下](https://github.com/incuisting/fakePromise/commit/71f71ee43b69ea8ee632f3b447dbd49de7955aad)  
写一个方法来判断和处理这个 x  
1.[处理它是不是自己返回了自己](https://github.com/incuisting/fakePromise/commit/71f71ee43b69ea8ee632f3b447dbd49de7955aad)  
2.
[如果 x 是普通值就直接 resolve 掉](https://github.com/incuisting/fakePromise/commit/7c878b2cbf09b0e30258a3bab351f9e37f59bb74)  
3.[如果不是 null 又是函数或者对象,那么先取一下 x 里的 then，判断一下它是不是方法，如果是调用，如果不是 reject。 ](https://github.com/incuisting/fakePromise/commit/1b5a118ff4ee437e6440f278bacc23ff49870fba)  
这里要加一个特殊情况的处理，为了防止别人写的 promise 库调用了失败或者成功之后再去调用失败或者成功  
[加一个状态判断](https://github.com/incuisting/fakePromise/commit/f0dc3c98d75974fa61ac99261e9d949126a0fe5d)

---

### then 的穿透

原生的 Promise 可以这样操作

```JavaScript
let FakePromise = require('./fakePromise')
let p = new FakePromise((resolve, reject) => {
resolve(100);

})
p.then().then().then((data)=>{
console.log(data);//期望拿到100
})
```

那么我们也实现一下  
[当 then 里面默认什么的都没有的时候给它一个默认值](https://github.com/incuisting/fakePromise/commit/aeed599c34c20d213a347cb74853010fb977c338)  
最后 promise A+ 规范规定了所有的成功或者失败的操作都需要是异步执行的，所以我们这边用 setTimeout 创造一个异步的环境，同时因为时异步了，成功或者失败的抛错要 try catch 一下。  
[为了符合 promise a+ 的标准，所有的成功或者失败都要异步执行](https://github.com/incuisting/fakePromise/commit/a645906a30eda73a99e3906ad9a3a28cc9357d59)

---

### 测试是否符合规范

写了这么多，东西到底符合不符合规范？测试一下  
[添加一个方法供测试用](https://github.com/incuisting/fakePromise/commit/ed4e30131fb55bef1237ca4ce007b51981505490)  
在当前目录打开命令行

```bash
npm install promises-aplus-tests -g
```

```bash
promises-aplus-tests ./你的promise文件
```

等待全部跑完。。。。。。你会发现有一堆错误。居然翻车了。那么到底哪里写错了？  
问题就在这里[x 在判断的时候应该是不等于 null 并且是 object 或者 函数](https://github.com/incuisting/fakePromise/commit/fa9c0c2e8a0498121578e122bef717151d3cc883)  
然后再测一次，基本就成了。到这里核心的功能就都完成了

### 拓展 Promise

[Promise.catch](https://github.com/incuisting/fakePromise/commit/445d033d36040460d2aab1a2377bd0a0b91faeb6)  
[Promise.all](https://github.com/incuisting/fakePromise/commit/d82a8014f357d4383d9d27c356330bf76b05a0fe)  
[Promise.race](https://github.com/incuisting/fakePromise/commit/749e4d324cc2a2af5712be348b06f5267e8009b0)  
[Promise.resolve 和 Promise.reject](https://github.com/incuisting/fakePromise/commit/4821704597e5077b0b9161aac9bcf1770459ce00)  
到此为止就把 Promise 以及它的附加的方法都实现完了
