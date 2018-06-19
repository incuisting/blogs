# TCP在Nodejs中的使用
本文不具体将TCP的细节，只是讲讲在nodejs中怎么用它原生实现的TCP模块`net`
首先起一个最简单的示例:
```javascript
//引入net模块
let net = require('net')
//调用net上的createServer方法创建一个服务
let server = net.createServer()
//server是基于node的EventEmiter,可以通过监听事件的方法来进行操作
server.on('connection', function() {
  console.log('hello')
})
//server在某个端口监听
server.listen(3000)
```
上面这么多代码就已经把TCP的服务启动起来了，可以用putty测试一下。
![putty](../pic/TCP1.png)
如果一切正确，在点击了`open`之后控制面板就会出现`hello`
![hello](../pic/TCP2.png)
