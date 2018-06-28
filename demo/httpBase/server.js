//引入http模块
let http = require('http')
// 通过createServer()创建一个服务
let server = http.createServer()
//监听request事件，也就是收到请求的时候
server.on('request', function(req, res) {
  //获取请求的方法
  console.log(req.method)
  //获取请求的url
  console.log(req.url)
  //获取http协议版本
  console.log(req.httpVersion)
  // 拿到的是请求头对象，你要取里面的具体的参数可以通过key来取(是小写的)
  console.log(req.headers['user-agent'])
  res.writeHead(200, {
    'Content-Type': 'text/plain;charset=utf-8'
  })
  res.end('你好')
})
//服务在本地3000端口监听
server.listen(3000, function() {
  //这个回调会在服务启动成功后被调用
  console.log('server start 3000')
})
