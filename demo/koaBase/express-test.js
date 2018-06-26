let express = require('express')
let app = express()
function log() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('123')
    }, 1000)
  })
}
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
app.listen(3000)
