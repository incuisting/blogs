# 初探nodejs的stream
****
### 什么是流?

`Stream(流)` 就和它得名字一样，我们可以把它想象成像水流，从一个地方流向另外一个地方。按照一定速率，有快有慢。而 Nodejs 里流则是将数据以一定的速率从原文件流向目标文件。它最基本的原理，按照官方对它的描述，它是一个发布订阅，因为它继承自`EventEmitter`,然后再去实现出了`Readable(可读流)`,`Writeable(可写流)`,`Duplex(双工流,既可读又可写)`。其中`Readable(可读流)`使你可以从一个文件读数据 而`Writeable(可写流)`则是允许你向目标文件写入数据。Nodejs 那么最常见的流的例子就是来自`http server`，它的`request` 就是一个`Readable(可读流)`而它的`response`则是一个`Writeable(可写流)`

---

### 为什么要使用流？

说了这么多，可是我们为什么要使用流呢？它能给我们带来什么好处呢？
这里有这样一个例子  
我们先要制造一个大文件来充当测试用例：

```JavaScript
const fs = require('fs');
const file = fs.createWriteStream('./big.file');

for(let i=0; i<= 1e6; i++) {
file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');

}

file.end();
```

我用了可写流来制造这个大文件。
`fs`模块实现了`streams` 的接口，使其既可以被用来读取文件，又可以用来执行写入的操作。在上面的例子中，我们通过循环的调用可写流，在该文件中写入了 100 万行。
跑一下上面的脚本将会生成一个大小 400 MB 左右的文件。
这是一个简单的 **Node web 服务器**，专门为 `big.file` 提供服务：

```JavaScript
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
fs.readFile('./big.file', (err, data) => {
if (err) throw err;
res.end(data);

});

});

server.listen(8000);
```

当服务器获得请求时，它将使用异步方法 `fs.readFile` 读取大文件并返回给客户端。很简单的几行代码，看上去其表现不会跟一大堆事件循环或者其他复杂的代码那样。
那么，让我们运行服务器，并在请求这个文件时监视内存，看看会发生什么。
当我启动服务时，它开始处于一个正常的内存量，**8.7 MB**：
![initMermory](https://user-gold-cdn.xitu.io/2018/6/3/163c464df0dfa0b1?w=800&h=422&f=png&s=77976)
然后我发起请求，注意看内存用量发生了什么变化：
![gaintMermory](https://user-gold-cdn.xitu.io/2018/6/3/163c4659c5e32fb7?w=800&h=615&f=gif&s=3447889)
内存用量居然涨到了 **434.8 MB**。
我们基本上把整个 `big.file` 的内容都放在内存中了，然后再把它写到响应对象中。这是非常低效的。
HTTP 响应对象（上面的代码中的 res ）也是可写的流。这意味着如果我们有一个代表 `big.file` 的内容的可读流，我们可以直接让这两个对象通过 `pipe` 连接(pipe 在文章后半会将到)，不用耗费 400 MB 的内存就能实现相同的功能。
`fs` 模块可以使用 `createReadStream` 方法为任何文件提供可读的流。 我们可以将其传递给响应对象：

```JavaScript
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
const src = fs.createReadStream('./big.file');
src.pipe(res);

});

server.listen(8000);
```

现在，当你再次发出请求，会发生一个神奇的事情（看内存消耗）：

![lessMermory](https://user-gold-cdn.xitu.io/2018/6/3/163c4686f3add6a9?w=900&h=692&f=gif&s=4412809)
发生了什么？  
当客户端请求这个大文件时，我们每次流式传输一个**块**，这意味着我们不会在内存中缓存该文件。内存的使用量大约增长了**25 MB**，就是这样。
`Stream流`它可以帮我们用**很小**得内存去读取一个**大文件**，对于内存就是 rmb 的服务器，`stream流`可以说就是一个核弹。那么接下来就具体看看它怎么用吧

---

### Readable stream 可读流

**可读流**允许你从一个数据源读取数据，这个数据源可以是任何形式，可以是一个**普通文件**，或者是**系统文件**，或者**内存中的 buffer**，甚至是**另外一个 Stream(流)**。  
`Stream(流)`作为一个`EventEmitter`它会在执行的各个阶段，emit 各种事件，我们可以通过这些事件对流进行控制

#### 具体使用

从`Stream(流)`中读取数据的最佳方式之一就是监听`Stream(流)`的`data` 事件,并给一个事件的`callback`。当一个数据块被读取时，可读流会`emit`一个`data`事件，同时执行`callback`。  
就像下面这样：

```JavaScript
let fs = require('fs');
let readableStream = fs.createReadStream('file.txt');
let data = '';

readableStream.on('data', function(chunk) {
data+=chunk;

});

readableStream.on('end', function() {
console.log(data);

});
```

调用 `fs.createReadStream` 会为你生成一个`可读流`。最初这个流是**静止**的，当你去**监听**`data` 事件，并给它一个`callback` 。这个流就**开始流动**。数据按照**默认 64k**的速度塞进我们给它的那个`callback`里。(如果要改变读取速率可以参考
[nodejs 官方文档](https://user-gold-cdn.xitu.io/2018/6/3/163c4b6231debcdb)设置 highWaterMark 的值)
当数据被都**读取完**之后，流会`emit` 一个`end`事件，在上面的代码块中，我们会在流读完之后得到一个把全部内容打印出的 log

还有另外一种读取的方式，就是**监听**`readable` 事件，然后调用流的`read()`方法，数据就可以被源源不断的读出，直到读完

```JavaScript
let fs = require('fs');
let readableStream = fs.createReadStream('file.txt');
let data = '';
let chunk;

readableStream.on('readable', function() {
while ((chunk=readableStream.read()) != null) {
data += chunk;

}

});

readableStream.on('end', function() {
console.log(data)

});
```

`read()`方法会读取一定数量的数据以 Buffer 的形式返回出来，当数据全都读完了，会返回一个`null`，所以在上面代码中，当没有数据读返回`null`的时候就退出了`while`循环。同时触发`end`,log 出全部数据。但是你会发现 log 出来的东西并不是你预期的字符串。还有一点`read()`是可以传参数的，如果不传的话就一次性把缓存里的数据全部读出来。

#### 设置编码

由于从流里读出的数据默认是`Buffer`，如果你需要得到一个`String`，那么就必须设置编码格式。通过调用流上的`setEncoding()`,像下面这样:

```JavaScript
let fs = require('fs');
let readableStream = fs.createReadStream('file.txt');
let data = '';

readableStream.setEncoding('utf8');

readableStream.on('data', function(chunk) {
data+=chunk;

});

readableStream.on('end', function() {
console.log(data);

});
```

上面我们把编码设置成了`UTF-8`，最后`end`触发的时候被 log 出的数据就会以`UTF-8`的格式展现。

---

### Writeable steam 可写流

可写流，可以将数据写入一个地方。和可读流一样它的本质也是`EventEmitter`,所以它在执行各个阶段也会 emit 各种事件。我直接通过监听这些事件就可以操作它。
怎么写？
如果要写入数据，你需要调用流上的 write 方法
举个例子：

```JavaScript
let fs = require('fs');
let readableStream = fs.createReadStream('file1.txt');
let writableStream = fs.createWriteStream('file2.txt');

readableStream.setEncoding('utf8');

readableStream.on('data', function(chunk) {
writableStream.write(chunk);

});
```

上面的代码，就是单纯的从一个**可读流**里读到数据，然后通过调用**可写流**的 `write()`方法写到目标文件里去。`write()`方法调用后会返回一个**布尔值**，`true`表示还可以继续添加数据到本次的写入中，如果返回一个`false`则表示当前不能再添加数据去写入了，需要等到当前数据块写完，才可以继续添加。所以可写流会在写完当前的数据块后会`emit`一个`drain`事件，表示自己可以再次开始接受数据写入了。同样写入的`fs.createWriteStream()`创建的可写流的写入速率也是可以设置的，不过它不像`fs.createReadableStream()`一样可以提前配置。官方文档的用法是在`fs.createWriteStream()`返回可写流以后单独调用可读流`writableHighWaterMark()`进行设置(参考官方文档[fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)和[writable.writableHighWaterMark](https://nodejs.org/api/stream.html#stream_writable_writablehighwatermark))

### Pipe

```JavaScript
readableSrc.pipe(writableDest)
```

`Pipe`是**可读流**上的一个方法，它可以很好的将**可读流**与**可写流**串起来。它将可读流的**输出**（数据源）作为可写流的**输入**，所以**数据源**必须是可读流，目标必须是可写流。当然，双工流和转换流都是没问题的。  
具体使用如下：

```JavaScript
let fs = require('fs');
let readableStream = fs.createReadStream('file1.txt');
let writableStream = fs.createWriteStream('file2.txt');

readableStream.pipe(writableStream);
```

上述代码通过`pipe()`方法将`file1`的内容写到`file2`的内容，用`pipe（）`的好处就是，它会帮你控制数据流，你不用关心数据流是快还是慢。还有个需要注意的是，`pipe()`把写入后的结果以**可读流**的形式返回出来。这就意味着`pipe()`它可以进行**链式调用**。  
我们可以这样:

```JavaScript
a.pipe(b).pipe(c).pipe(d)

// 功能相同的代码:
a.pipe(b)
b.pipe(c)
c.pipe(d)
```

`pipe()`方法是最简单的消费流的方法。一般比较建议使用 `pipe()` 方法或使用`事件`来消费流，但应该**避免混合使用这两种方式**。通常当你使用 `pipe()`方法时，不需要使用事件，但是如果你需要以自定义的方式使用 streams，那么使用事件可能有些必要。

### 最后

初次研究 nodejs 的流，应该只是说到了它的皮毛,后续有时间还需要深入研究。探究内部的原理。

---

### 参考

- [[译] Node.js Streams: 你应该知道的事情](https://github.com/leverz/leverz.github.io/issues/10)
- [https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93](https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93)
- [Node.js v10.3.0 Documentation](https://nodejs.org/api/index.html)
- [The Basics of Node.js Streams](https://www.sitepoint.com/basics-node-js-streams/)
- [stream-handbook](https://github.com/jabez128/stream-handbook)
