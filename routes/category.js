/*
**分类相关的操作
*
 */

const { Op, Sequelize } = require('sequelize')
const express = require('express')
const router = express.Router()


const Category = require('../models/category')
const Task = require('../models/task')
const sequelize = require('../core/db')
const { verifyToken } = require('../Edittoken')
const {
  SUCCESS,
  ERROR
} = require('../config')

const category = (app) => {

  /**
   * 导入新分类
   */

  router.put('/add', async (req, res) => {
    const {
      //分类名称
      name,
      //用户ID
      uid
    } = req.body

    const length = await Category.count({
      where: {
        uid
      },
      raw: true
    })

    //最多建三个分类清单
    if (length >= 3) {
      return res.send({
        errCode: ERROR,
        message: '最多可以创建三个分类清单',
      })
    }

    //错误处理
    try {
      await Category.create({ name, uid })
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
   **删除分类 一级分类下的所有任务选项
   */
  router.delete('/delete', async (req, res) => {
    const {
      //分类ID
      id,
    } = req.body

    //开启事务查询
    return sequelize.transaction(function (t) {
      // 在这里链接您的所有查询。 确保你返回他们。
      return Category.destroy({
        where: {
          id
        }
      }, { transaction: t }).then(function () {
        return Task.destroy({
          where: {
            category: id
          }
        }, { transaction: t });
      });
    }).then(function (result) {
      // 事务已被提交
      res.send({
        errCode: SUCCESS,
        message: '删除成功',
      })
    }).catch(function (err) {
      // 事务已被回滚
      // err 是拒绝 promise 链返回到事务回调的错误
      res.send({
        errCode: ERROR,
        message: '删除失败',
      })
    })
  })

  /**
   * 获取分类及分类的数量
   */
  router.get('/count/get', async (req, res) => {
    const {
      //用户id
      uid,
    } = req.query

    //查找所有分类
    const categories = await Category.findAll({
      where: {
        uid
      },
      attributes: ['id', 'name'],
      raw: true
    })
    
    //
    for (let i = 0; i < categories.length; i++) {
      categories[i].count = await Task.count({
        where: {
          category: categories[i].id
        }
      })
    }

    res.send({
      data: categories,
      errCode: SUCCESS,
      message: '获取成功'
    })
  })
  /**
   * 获取单个分类下的所有任务
   */
  router.get('/all_task/get', async (req, res) => {
    const { id, uid } = req.query

    const data = await Task.findAll({
      where: {
        category: id,
        name: {
          [Op.not]: null
        }
      },
      order: [[
        'id', 'DESC'
      ]],
      raw: true
    })

    res.send({
      data,
      message: '请求成功',
      errCode: SUCCESS
    })
  })
  
  //前面加一个验证路由,防止没有登录
  app.use('/category', verifyToken, router)
}


module.exports = category




