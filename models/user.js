const sequelize = require('../core/db')
const { DataTypes, Sequelize } = require('sequelize')



const User = sequelize.define("user", {
  //用户ID
  uid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true
  },
  //openId
  openid: {
    type: DataTypes.STRING(50),
    unique: true
  },
  //昵称
  nickname: {
    type: DataTypes.STRING(50)
  },
  //邮箱
  email: {
    type: DataTypes.STRING(20)
  },
  //性别
  gender: {
    type: DataTypes.ENUM('男', '女'),
  },
  password: {
    type: DataTypes.STRING(20)
  },
  //个性签名
  autograph: {
    type: DataTypes.STRING(200)
  },
  //头像
  avatarUrl: {
    type: DataTypes.STRING(300)
  }
});

(async () => {
  await sequelize.sync({ force: false });
  // Code here
})();





module.exports = User