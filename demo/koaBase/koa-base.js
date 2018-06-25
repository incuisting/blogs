let Koa = require('koa')
let app = new Koa()
//koa 不继承路由，如果需要路由还需要用另外的路由中间件
// koa 把req 和res 封装在了 ctx 里
// ctx里还包括了自己封装的request response
app.use((ctx, next) => {
  ctx.body = 'hello'
  //body 可以被多次调用
  ctx.body = 'world'
  // 多次掉用body 去最后一次的值
})
app.listen(3000)
