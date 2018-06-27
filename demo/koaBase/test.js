//把原先的express用对象替换
let app = {}
//存放中间件的回调函数
app.routes = []
//提供use方法模拟最基本的功能
app.use = function(fn) {
  //每次调用use就把传入的回调函数推到routes数组尾部
  app.routes.push(fn)
}
//异步log
function log() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('123')
    }, 1000)
  })
}
//开始调用
app.use(async (req, res, next) => {
  console.log(1)
  await next()
  console.log(2)
})
app.use(async (req, res, next) => {
  console.log(3)
  let r = await log()
  console.log(r)
  next()
  console.log(4)
})
app.use((req, res, next) => {
  console.log(5)
  next()
  console.log(6)
})

let index = 0
//这个next只有最最基础的功能
function next() {
  // 最后一个next调用之后就直接跳出了递归
  if (app.routes.length === index) return
  //取出routes里当前index的中间件回调，然后把index + 1
  let route = app.routes[index++]
  //执行这个中间件回调，为了方便这里req,res就都传空对象了，最后把next自己再传入
  return route({}, {}, () => next())
}
//执行next
next()
