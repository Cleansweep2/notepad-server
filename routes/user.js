/**
 * 用户相关的路由
 * 1. 登录
 * 2. 注册
 * 3. 注销
 * 4. 修改密码
 * 5. 修改信息等
 */
const express = require('express')
const router = express.Router()
const axios = require('axios')
const { Op } = require('sequelize')

const sequelize = require('../core/db')
const User = require('../models/user')
const Category = require('../models/category')
const Task = require('../models/task')
const Note = require('../models/note')
const Diary = require('../models/diary')

const {
  SUCCESS,
  NOT_USER,
} = require('../config')
const {
  genToken,
  verifyToken
} = require('../Edittoken/index')

/**
 *
 * 微信登录
 */
const user = (app) => {
  router.post('/login/wx', async (req, res) => {
    const { code, nickname, gender, avatarUrl } = req.body

    console.log(avatarUrl)
    const result = await axios({
      method: 'get',
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=wxe1b778479eb5cb6e&secret=71c231cb5df86a09a271bfa126b0b2fe&js_code=${code}&grant_type=authorization_code`,
    })
    const { openid } = result.data
    if (!openid) {
      res.send({
        errCode: NOT_USER,
        message: '没有此用户'
      })
    }

    let user

    user = await User.findOne({
      where: {
        openid
      },
      raw: true
    })

    if (!user) {
      user = await User.create({ openid, nickname, gender, avatarUrl })
    }
    const token = await genToken({})
    res.send({
      errCode: SUCCESS,
      message: '登陆成功',
      token,
      user,
    })
  })

  /**
   * 普通登录
   */
  router.post('/login/ordinary', async (req, res) => {
    const { email, password } = req.body

    console.log(email, password)
    let user

    user = await User.findOne({
      where: {
        password,
        [Op.or]: [{ email, }, { nickname: email }]
      },
      raw: true
    })

    if (!user) {
      return res.send({
        errCode: NOT_USER,
        message: '没有此用户',
      })
    }
    const token = await genToken({})
    res.send({
      errCode: SUCCESS,
      message: '登陆成功',
      token,
      user,
    })
  })

  /**
   * 注册
   */
  router.post('/register', async (req, res) => {
    const { nickname, email, password } = req.body
    let user

    user = await User.findOne({
      where: {
        nickname
      },
      raw: true
    })

    //如果有用户
    if (user) {
      return res.send({
        errCode: ESISTS_USER,
        message: '存在此用户',
      })
    }
    if (!user) {
      await User.create({ nickname, email, password })
    }

    res.send({
      errCode: SUCCESS,
      message: '注册成功',
    })
  })

  /**
   * 注销用户
   */
  router.post('/cancellation', async (req,res) => {
    const { uid } = req.body

    //开启事务查询
    //删除用户所有的信息
    return sequelize.transaction(function (t) {
      // 在这里链接您的所有查询。 确保你返回他们。
      //删除用户
      return User.destroy({
        where: {
          uid
        }
      }, { transaction: t }).then(function () {
        //删除笔记
        return Task.destroy({
          where: {
            uid
          }
        }, { transaction: t }).then(function () {
          return Category.destroy({
            where:{
              uid
            }
          },{transaction:true}).then(function () {
            return Note.destroy({
              where:{
                uid
              }
            },{transaction:t}).then(function () {
              return Diary.destroy({
                where:{
                  uid
                }
              })
            })
          })
        })
      });
    }).then(function (result) {
      // 事务已被提交
      console.log(uid)
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
   * 用户信息的更新
   */
  router.post('/info/update', async (req, res) => {
    const { uid, type } = req.body
    let edit = null
    let editTarget = null

    //修改签名
    if (type === 'autograph') {
      const { autograph } = req.body
      editTarget = 'autograph'
      edit = autograph
      //修改密码
    } else if (type === 'password') {
      const { password } = req.body
      editTarget = 'password'
      edit = password
    }

    try {
      await User.update({
        [editTarget]: edit
      }, {
        where: {
          uid
        }
      })
    } catch (e) {
      return res.send({
        errCode: Error,
        message: '修改失败'
      })
    }

    res.send({
      message: '修改成功',
      errCode: SUCCESS
    })
  })


  //验证token
  router.post('/verify', verifyToken)

  app.use(router)
}


module.exports = user

