/*
**任务清单相关的操作
 */

const { Op } = require('sequelize')
const express = require('express')
const router = express.Router()

const Task = require('../models/task')
const Category = require('../models/category')
const { verifyToken } = require('../Edittoken')
const sequelize = require('../core/db')
const Sequelize = require('sequelize')
const {
  SUCCESS,
  ERROR
} = require('../config')


const task = (app) => {

  /**
   * 添加任务
   */

  router.put('/add', async (req, res) => {
    const {
      //分类名称
      category,
      //用户ID
      uid,
      //事件名
      name
    } = req.body


    try {
      await Task.create({ category, uid, name })
    } catch (e) {
      res.send({
        errCode: ERROR,
        message: '写入失败',
      })
    }
    res.send({
      errCode: SUCCESS,
      message: '写入成功',
    })
  })

  /**
   * 更改任务名称
   */
  router.post('/update', async (req, res) => {
    const {
      //任务id
      id,
      is_complete
    } = req.body

    console.log(id)
    try {
      await Task.update({
        is_complete
      }, {
        where: {
          id,
        }
      })
    } catch (e) {
      res.send({
        errCode: ERROR,
        message: '编辑失败',
      })
    }
    res.send({
      errCode: SUCCESS,
      message: '编辑成功',
    })
  })

  /**
   * 更改任务完成还是未完成
   */
  router.post('/update', async (req, res) => {
    const {
      //任务id
      id,
      is_complete
    } = req.body
    try {
      await Task.update({
        is_complete
      }, {
        where: {
          id,
        }
      })
    } catch (e) {
      res.send({
        errCode: ERROR,
        message: '编辑失败',
      })
    }
    res.send({
      errCode: SUCCESS,
      message: '编辑成功',
    })
  })

  /**
   **删除任务
   */
  router.delete('/delete', async (req, res) => {
    const {
      //任务ID
      id,
    } = req.body

    try {
      await Task.destroy({
        where: {
          id
        }
      })
    } catch (e) {
      res.send({
        errCode: ERROR,
        message: '删除失败',
      })
    }
    res.send({
      errCode: SUCCESS,
      message: '删除成功',
    })
  })

  /**
   * 获取所有数据
   */
  router.get('/all/get', async (req, res) => {
    const { uid } = req.query
    let result
    result = await Task.findAll({
      where: {
        uid
      },
      raw: true
    })

    //原始的SQL查询
    const today = await sequelize.query(`
      SELECT * FROM categories join tasks
      on categories.id = tasks.category
      WHERE tasks.name IS NOT NULL and tasks.uid=${uid}
      and datediff(curdate(),tasks.createdAt)=0
      `, { replacements: ['active'], type: sequelize.QueryTypes.SELECT })

    res.send({
      errCode: SUCCESS,
      message: '获取成功',
      data: result,
      today
    })
  })


  /**
   * 未完成,完成的,所有数据
   */
  router.get('/:type/get', async (req, res) => {
    const { type } = req.params
    const { uid } = req.query
    let result
    Category.hasMany(Task, { foreignKey: 'category', targetKey: 'id' })
    if (type.length === 1) {
      result = await Category.findAll({
        include: {
          model: Task,
          where: {
            //名字不为空
            name: {
              [Op.not]: null
            },
            is_complete: type,
            uid
          },
          order: [[
            'createdAt', 'ASC'
          ]]
        },
        order: [['tasks', 'id', 'DESC']],
        raw: true,
      })
    } else {
      //获取当天的数据
      result = await sequelize.query(`
      SELECT * FROM categories join tasks
      on categories.id = tasks.category
      WHERE tasks.uid=${uid}
      and datediff(curdate(),tasks.createdAt)=0
      `, { replacements: ['active'], type: sequelize.QueryTypes.SELECT })
    }

    res.send({
      errCode: SUCCESS,
      message: '获取成功',
      data: result
    })
  })

  // 
  //前面加一个验证路由,防止没有登录
  app.use('/task',verifyToken,router)
}

module.exports = task