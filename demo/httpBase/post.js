let http = require('http')
let server = http.createServer()
let queryString = require('querystring')
server.on('request', function(req, res) {
  let arr = []
  // on('data')可能触发多次
  req.on('data', function(data) {
    // 只要是post请求就需要通过监听data事件获取数据
    arr.push(data)
  })
  req.on('end', function() {
    let str = Buffer.concat(arr).toString()
    // let body = queryString.parse(str)
    console.log(arr)
    console.log(str)
    res.end(`hello${str}`)
  })
})
server.listen(3000, function() {
  console.log(`server start 3000`)
})
