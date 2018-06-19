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
