/*
**笔记相关的操作
*
 */


const express = require('express')
const router = express.Router()


const Note = require('../models/note')
const { verifyToken } = require('../Edittoken')
const {
  SUCCESS,
  ERROR
} = require('../config')




const note = (app) => {

  /**
   * 写入笔记
   */

  router.put('/add', async (req, res) => {
    const {
      //标题
      title,
      //html内容
      contentHtml,
      //文字内容
      contentText,
      //用户ID
      uid,
      c_time
    } = req.body
    try {
      await Note.create({ title, contentHtml, contentText, uid, c_time })
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
   * 更改笔记
   */

  router.post('/update', async (req, res) => {
    const {
      //文章id
      id,
      //标题
      title,
      //html内容
      contentHtml,
      //文字内容
      contentText,
    } = req.body

    try {
      await Note.update({
        title,
        contentHtml,
        contentText,
      }, {
        where: {
          id,
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
   **删除笔记
   */
  router.delete('/delete', async (req, res) => {
    const {
      //文章id
      id,
    } = req.body

    try {
      Note.destroy({
        where: {
          id
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
   * 获取笔记
   */

  router.get('/get', async (req, res) => {
    const {
      //文章id
      uid,
    } = req.query

    //把结果存入数组
    const result = []

    //按照c_time进行分组
    const c_times = await Note.findAll({
      where: {
        uid
      },
      attributes: ['c_time'],
      group: 'c_time',
      raw: true
    })

    let c_time
    //得到每一分组下的列表
    for (let i = 0; i < c_times.length; i++) {
      c_time = c_times[i].c_time
      const data = await Note.findAll({
        where: {
          c_time,
        },
        order: [['createdAt', 'ASC']],
        raw: true
      })

      result.push({
        c_time,
        data,
      })
    }

    res.send({
      errCode: SUCCESS,
      message: '获取成功',
      data: result
    })
  })

  /**
   * 获取单个笔记
   */
  router.get('/:id/get', async (req, res) => {
    const { id } = req.params

    const result = await Note.findOne({
      where: {
        id
      },
      raw: true
    })


    res.send({
      errCode: SUCCESS,
      message: '获取成功',
      data: result
    })
  })

  //前面加一个验证路由,防止没有登录
  app.use('/note', verifyToken, router)

}

module.exports = note