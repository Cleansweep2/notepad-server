const express = require('express')
const { Op } = require('sequelize')
const router = express.Router()

const Note = require('../models/note')
const { verifyToken } = require('../Edittoken')

const {
  SUCCESS,
  ERROR
} = require('../config')


const search = (app) => {


  router.get('/get', async (req, res) => {
    const { keyWord, uid } = req.query

    // 获取所有含有关键字的笔记
    const result = await Note.findAll({
      where: {
        uid,
        [Op.or]: [
          {
            title: {
              //正则
              [Op.like]: `%${keyWord}%`
            }
          },
          {
            contentText: {
              [Op.like]: `%${keyWord}%`
            }
          }
        ]
      }
    })

    res.send({
      errCode: SUCCESS,
      data: result,
      message: '获取成功'
    })

  })


  app.use('/search', verifyToken, router)
}

module.exports = search