'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class borrowUser extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    borrowUser.init({
    fullname:DataTypes.STRING,
    borrowcode:DataTypes.STRING,
    dateborrow: DataTypes.DATE,
    datareturn: DataTypes.DATE,
    borrowstatus:DataTypes.STRING,
    description: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'borrowUser',
    });
    return borrowUser;
};