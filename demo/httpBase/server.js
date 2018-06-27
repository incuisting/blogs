//引入http模块
let http = require('http')
// 通过createServer()创建一个服务
let server = http.createServer()
//监听request事件，也就是收到请求的时候
server.on('request', function(req, res) {
  //响应体里写入hello world，回复给浏览器
  res.writeHead(200, {
    a: '1',
    b: '2'
  })
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('你好')
})
//服务在本地3000端口监听
server.listen(3000, function() {
  //这个回调会在服务启动成功后被调用
  console.log('server start 3000')
})
