const cors = require('cors')
const bodyParser = require('body-parser')



// 路由
const User = require('../routes/user')
const Note = require('../routes/note')
const Diary = require('../routes/diary')
const Category = require('../routes/category')
const Search = require('../routes/search')
const Task = require('../routes/task')



class Init{
  constructor(app){
    this.basicInit(app)
    this.routeInit(app)
    this.templateInit(app)
  }
  //基本的配置
  basicInit(app) {
    app.use(cors())

    //json数据
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
  }
  //路由的挂载
  routeInit(app) {
    //用户相关路由
    User(app)
    //笔记路由
    Note(app)
    //日记路由
    Diary(app)
    //分类路由
    Category(app)
    //搜索路由
    Search(app)
    //
    Task(app)
  }
  //模板引擎初始化
  templateInit(app) {
   
  }
}


module.exports = Init