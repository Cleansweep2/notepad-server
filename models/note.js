const sequelize = require('../core/db')
const { DataTypes } = require('sequelize')

const { Sequelize } = require('sequelize')



const Note = sequelize.define("note", {
  //标题
  title: { type: DataTypes.STRING(100), defaultValue: '无标题笔记' },
  //html内容
  contentHtml: { type: DataTypes.STRING(10000) },
  //文字内容
  contentText: { type: DataTypes.STRING(10000) },
  //用户ID
  uid: { type: DataTypes.STRING(50) },
  //id
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  c_time: {
    type: DataTypes.STRING(20)
  },
  //1,表示不选中 0,表示选中
  is_selected: {
    type: DataTypes.ENUM('0', '1'),
    defaultValue: '1'
  }
});

(async () => {
  await sequelize.sync({ force: false });
})();






// Note.create({
//   title:'第三个',
//   c_time:'2020-08-09'
// })


//
// Note.update({title:'第二个'},{
//   where:{
//     id:1
//   }
// })








module.exports = Note