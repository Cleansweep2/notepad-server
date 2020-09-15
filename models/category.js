/**
 *
 * 任务清单分类
 */
const sequelize = require('../core/db')
const { DataTypes } = require('sequelize')

const Category = sequelize.define("category", {
  //分类名称
  name: {
    type: DataTypes.STRING(50),
  },
  //与用户表关联的用户ID
  uid: {
    type: DataTypes.INTEGER
  },
  //分类ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
});

(async () => {
  await sequelize.sync({ force: false });
})();

module.exports = Category