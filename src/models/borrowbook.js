'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class borrowBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    borrowBook.init({
    borrowcode:DataTypes.STRING,
    bookcode:DataTypes.STRING,
    bookname: DataTypes.STRING,
    soluong: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'borrowBook',
    });
    return borrowBook;
};