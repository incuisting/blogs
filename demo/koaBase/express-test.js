let express = require('express');

let app = express();
app.use((req,res,next) => {
  console.log(1);
  next();
  console.log(2);
})
app.use((req, res, next) => {
  console.log(3);
  next();
  console.log(4);
})
app.use((req, res, next) => {
  console.log(5);
  next();
  console.log(6);
})
app.listen(3000);