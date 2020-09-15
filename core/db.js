const {Sequelize} = require('sequelize')
const {host,user,password,dbName} = require('../config').MYSQL_CONFIG
let sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  timezone: '+08:00',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  host,
})

//测试是否连接成功
const test = async () => {
  try {
    await sequelize.authenticate();
    console.info('数据库连接成功! MySql');
  } catch (error) {
    console.error('数据库连接失败! mongodb', error);
  }  
}

test()

module.exports = sequelize