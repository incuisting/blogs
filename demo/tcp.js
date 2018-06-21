//引入net模块
let net = require('net')
//调用net上的createServer方法创建一个服务
let server = net.createServer()
//server是基于node的EventEmiter,可以通过监听事件的方法来进行操作
server.on('connection', function(socket) {
  //socket是一个Duplex 可读可写
  socket.write('hello')
  //设置编码
  socket.setEncoding('utf8')
  // 可以通过流的方式接收到数据
  socket.on('data', function(data) {
    console.log(data)
    // server.close()
    // socket.end()
    server.unref()
  })
})
//监听close事件
server.on('close', function() {
  console.log('服务器关闭')
})
//server在某个端口监听
server.listen(3000)
