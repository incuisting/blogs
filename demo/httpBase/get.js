let http = require('http')
let url = require('url')
let server = http.createServer()
server.on('request', function(req, res) {
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  // 解析 url 参数
  let params = url.parse(req.url, true).query
  res.end(`${params.name},${params.password}`)
})
server.listen(3000)
