/**
 * 用户相关的路由
 * 1. 登录
 * 2. 注册
 * 3. 注销
 * 4. 修改密码
 * 5. 修改信息等
 */
const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Op } = require("sequelize");

const sequelize = require("../core/db");
const User = require("../models/user");
const Category = require("../models/category");
const Task = require("../models/task");
const Note = require("../models/note");
const Diary = require("../models/diary");
const Code = require("../models/code");

const randomCode = require("../util/random_code");

const {
  SUCCESS,
  ERROR,
  NOT_USER,
  ESISTS_USER,
  EMAIL,
  EMAIL_NAME,
  EMAIL_PWD,
} = require("../config");
const { genToken, verifyToken } = require("../Edittoken/index");

/**
 *
 * 微信登录
 */
const user = (app) => {
  router.post("/login/wx", async (req, res) => {
    const { code, nickname, gender, avatarUrl } = req.body;

    console.log(avatarUrl);
    const result = await axios({
      method: "get",
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=wxe1b778479eb5cb6e&secret=71c231cb5df86a09a271bfa126b0b2fe&js_code=${code}&grant_type=authorization_code`,
    });
    const { openid } = result.data;
    if (!openid) {
      res.send({
        errCode: NOT_USER,
        message: "没有此用户",
      });
    }

    let user;

    user = await User.findOne({
      where: {
        openid,
      },
      raw: true,
    });

    if (!user) {
      user = await User.create({ openid, nickname, gender, avatarUrl });
    }
    const token = await genToken({});
    res.send({
      errCode: SUCCESS,
      message: "登陆成功",
      token,
      user,
    });
  });

  /**
   * 普通登录
   */
  router.post("/login/ordinary", async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password);
    let user;

    user = await User.findOne({
      where: {
        password,
        [Op.or]: [{ email }, { nickname: email }],
      },
      raw: true,
    });

    if (!user) {
      return res.send({
        errCode: NOT_USER,
        message: "没有此用户",
      });
    }
    const token = await genToken({});
    console.log(token);
    res.send({
      errCode: SUCCESS,
      message: "登陆成功",
      token,
      user,
    });
  });

  /**
   * 注册
   */
  router.post("/register", async (req, res) => {
    const { nickname, email, password } = req.body;
    let user;

    user = await User.findOne({
      where: {
        nickname,
      },
      raw: true,
    });

    //如果有用户
    if (user) {
      return res.send({
        errCode: ESISTS_USER,
        message: "存在此用户",
      });
    }
    if (!user) {
      await User.create({ nickname, email, password });
    }

    res.send({
      errCode: SUCCESS,
      message: "注册成功",
    });
  });

  /**
   * 注销用户
   */
  router.post("/cancellation", async (req, res) => {
    const { uid } = req.body;

    //开启事务查询
    //删除用户所有的信息
    return sequelize
      .transaction(function (t) {
        // 在这里链接您的所有查询。 确保你返回他们。
        //删除用户
        return User.destroy(
          {
            where: {
              uid,
            },
          },
          { transaction: t }
        ).then(function () {
          //删除笔记
          return Task.destroy(
            {
              where: {
                uid,
              },
            },
            { transaction: t }
          ).then(function () {
            return Category.destroy(
              {
                where: {
                  uid,
                },
              },
              { transaction: true }
            ).then(function () {
              return Note.destroy(
                {
                  where: {
                    uid,
                  },
                },
                { transaction: t }
              ).then(function () {
                return Diary.destroy({
                  where: {
                    uid,
                  },
                });
              });
            });
          });
        });
      })
      .then(function (result) {
        // 事务已被提交
        console.log(uid);
        res.send({
          errCode: SUCCESS,
          message: "删除成功",
        });
      })
      .catch(function (err) {
        // 事务已被回滚
        // err 是拒绝 promise 链返回到事务回调的错误
        res.send({
          errCode: ERROR,
          message: "删除失败",
        });
      });
  });

  /**
   * 给用户发送通过邮箱发送验证码
   */
  router.post("/send_code", async (req, res) => {
    //从客户端获取的 email
    const { email } = req.body;

    const mailTransport = nodemailer.createTransport({
      service: "163",
      port: 465,
      secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
      auth: {
        user: `${EMAIL}`,
        pass: `${EMAIL_PWD}`,
      },
    });

    const code = randomCode()

    const options = { 
      from: `${EMAIL}`,
      to: `${email}`,
      subject: "一封来自趣记小程序的邮件",
      text: "一封来自趣记小程序的邮件",
      html: `<h1>你好，这是一封来自趣记小程序的邮件</h1><p>验证码为:<span style="font-weight:700;font-size:16px,text-align:center">${code}<span><p>`,
    };

    mailTransport.sendMail(options, async function (err, msg) {
      if (err) {
        return res.send({
          message: "接收失败",
          errCode: ERROR,
        });
      }
      
      console.log(email)
      await Code.create({email,verify_code:code})

      res.send({
        message: "接收成功",
        errCode: SUCCESS,
      });
    });
  });

  /**
   * 用户信息的更新
   */
  router.post("/info/update", async (req, res) => {
    const { type, uid, email } = req.body;
    let edit = null;
    let editTarget = null;

    //修改签名
    if (type === "autograph") {
      const { autograph } = req.body;
      editTarget = "autograph";
      edit = autograph;
      //修改密码
    } else if (type === "password") {
      const { password, verify_code } = req.body;
      const code = await Code.findOne({
        where: {
          email,
        },
      });
 
      //无论验证失败与否都删除 该用户的验证码
      await Code.destroy({
        where: {
          email,
        },
      });

      const v_code = code.verify_code;
      console.log(v_code,)
      console.log(verify_code)
      //验证验证码是否相同
      if (v_code !== verify_code) {
        return res.send({
          message: "验证码错误",
          errCode: ERROR,
        });
      }

      editTarget = "password";
      edit = password;
    }

    //捕获异常
    try {
      if (uid) {
        await User.update(
          {
            [editTarget]: edit,
          },
          {
            where: {
              uid,
            },
          }
        );
      } else {
        await User.update(
          {
            [editTarget]: edit,
          },
          {
            where: {
              email,
            },
          }
        );
      }
    } catch (e) {
      return res.send({
        errCode: Error,
        message: "修改失败",
      });
    }

    res.send({
      message: "修改成功",
      errCode: SUCCESS,
    }); 
  });

  //验证token
  router.post("/verify", verifyToken);

  app.use(router);
};

module.exports = user;
