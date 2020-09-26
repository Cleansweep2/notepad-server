const sequelize = require('../core/db')
const { DataTypes, Sequelize } = require('sequelize')



const Code = sequelize.define("code", {
  //用户的邮箱
  email: {
    type: DataTypes.STRING(30),
  },
  verify_code: { 
    type:DataTypes.STRING(6),
  },
});

(async () => {
  await sequelize.sync({ force: false });
  // Code here
})();



module.exports = Code