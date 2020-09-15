const { DataTypes } = require('sequelize')
const sequelize = require('../core/db')



const Task = sequelize.define("task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.INTEGER
  },
  is_complete: {
    //0是完成,1是未完成
    type: DataTypes.ENUM('0', '1'),
    //默认是1 未完成
    defaultValue: '1'
  },
  //事件的名称
  name: { type: DataTypes.STRING(100) },
  //uid 哪个用户写的
  uid: { type: DataTypes.INTEGER }
});

(async () => {
  await sequelize.sync({ force: false });
})();


module.exports = Task