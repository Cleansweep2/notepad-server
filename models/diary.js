const sequelize = require('../core/db')
const { DataTypes } = require('sequelize')


const Diary = sequelize.define("diary", {
  //html内容
  contentHtml: { type: DataTypes.STRING(10000) },
  //文字内容
  contentText: { type: DataTypes.STRING(10000) },
  //用户ID
  uid: { type: DataTypes.STRING(50) },
  //心情
  mood: {
    type: DataTypes.STRING(10)
  },
  //id
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  c_time: {
    type: DataTypes.STRING(20)
  }
});


module.exports = Diary