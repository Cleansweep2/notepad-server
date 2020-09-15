const express = require('express')
const {PORT} = require('./config')

const app = express()


const Init = require('./core/init')
require('./core/db')
//初始化
new Init(app)


//监听
app.listen(PORT, () => {
  console.log('开启了')
})


