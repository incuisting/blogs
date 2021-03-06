Node中的http模块可以快速为我们提供一个http服务。    
这篇文章就来摸一摸它那些常用API的用法    
先起一个最基础的服务**Hello World**一下：    
```javascript
//引入http模块
let http = require('http')
// 通过createServer()创建一个服务
let server = http.createServer()
//监听request事件，也就是收到请求的时候
server.on('request', function(req, res) {
  //响应体里写入hello world，回复给浏览器
  res.end('hello world')
})
//服务在本地3000端口监听
server.listen(3000, function() {
  //这个回调会在服务启动成功后被调用
  console.log('server start 3000')
})
```    
运行上述代码，然后打开浏览器`localhost:3000`    
![init](../pic/http1.png)    
那么如果把我**hello world** 改成 **你好**：    
```javascript
server.on('request', function(req, res) {
  //响应体里写入hello world，回复给浏览器
  res.end('你好')
})
```   
![chinese](../pic/http2.png)    
恭喜获得一堆乱码。   
主要还是编码问题，简单设置一下：    
```javascript
server.on('request', function(req, res) {
    //设置响应头，设置编码格式
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('你好')
})
```   
![header](../pic/http3.png)    
通过`setHeader`的方式告诉浏览器需要被解析的编码格式，不过设置响应头还可以通过`writeHead`的方式设置：    
```javascript
server.on('request', function(req, res) {
  res.writeHead(200,{
    'Content-Type': 'text/plain;charset=utf-8'
  })
  res.end('你好')
})
```   
`setHeader`和`writeHead`区别在于，设置多个请求头的时候，`setHeader`由于一次只能设置一个所以需要而且允许被多次调用，`writeHead`只能调用一次。而且如果你调用了`writeHead`,在此之后你还要调用了`setHeader`就直接报错了，因为`writeHead`之后就不允许再设置头了。所以一般会建议使用`setHeader`比较灵活一些.   
更多API可以参考[官方文档](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_class_http_serverresponse)     

接下去再来讲讲另外一个参数`req` 也就是`request`，请求。`req`只要你合理调用API可以获得一切你想知道的关于请求的信息    
比如：
```javascript
server.on('request', function(req, res) {
  //获取请求的方法
  console.log(req.method);
  //获取请求的url
  console.log(req.url);
  //获取http协议版本
  console.log(req.httpVersion);
  // 拿到的是请求头对象，你要取里面的具体的参数可以通过key来取(是小写的)
  console.log(req.headers['user-agent']); 
  res.writeHead(200,{
    'Content-Type': 'text/plain;charset=utf-8'
  })
  res.end('你好')
}
```   
允许代码，用浏览器打开`localhost:3000`    
在服务端控制台得到如下：    
```
GET
/
1.1
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36   
```   
既然可以拿到方法和路径，那接下来可以试着去处理GET/POST请求    
## GET    
```javascript
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
```    
测试一下。   
![get](../pic/http4.png)    
成功解析出了url里的信息    
如果想具体了解一下url.parse这个方法的话可以参考[官方文档](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_message_url)     

## POST    
```javascript
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
    res.end(`hello${str}`)
  })
})
server.listen(3000, function() {
  console.log(`server start 3000`)
})
```
运行一下，用postman测试一下    
![post](../pic/http5.png)    
成功达到了预期的效果。    
# 参考   
[nodejs文档](https://nodejs.org/dist/latest-v10.x/docs/api/http.html)