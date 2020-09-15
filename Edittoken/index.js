/**
 *对token的生成和验证
 */

const jwt = require('jsonwebtoken')
const {SECRET,EXI,NOT_LOGIN,SUCCESS} = require('../config')


//生成token
async function genToken(user) {
  //一个月的有效期
  const token = await jwt.sign(user, SECRET, { expiresIn: `${1000 * 60 * 604800}` })
  return token
}


//验证是否登录 token
async function verifyToken(req,res,next) {

  const {token} = req.headers
  const {path} = req
  if(!token)
  {
   return res.send({
      errCode:NOT_LOGIN,
      message:'请先登录'
    })
  }

  //判断是不是verify
  if(Object.is('/verify',path))
  {
    //第一次进入页面 才验证 其他情况暂时不处理 token是否过期 只要有token就可以了
    try {
      await jwt.verify(token, SECRET)
    } catch (error) {
      return  res.send({
        errCode:EXI,
        message:'登陆过期请重新登陆'
      })
    }
    res.send({
      errCode:SUCCESS,
      message:'验证成功',
    })
  }else{
    next()
  }
}

module.exports = {
  genToken,
  verifyToken
}
