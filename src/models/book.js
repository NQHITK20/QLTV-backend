'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Book extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Book.belongsTo(models.Category, { foreignKey: 'category', as: 'Data' });
            Book.hasMany(models.FvBook, {
            foreignKey: 'idfvbook', // Khóa ngoại bên bảng fvbooks trỏ tới book.id
             as: 'favorites',
            });
        }
    }

    Book.init({
        bookName: DataTypes.STRING,
        author: DataTypes.INTEGER,
        bookCode: DataTypes.STRING,
        category: DataTypes.INTEGER,
        soLuong: DataTypes.INTEGER,
        price: DataTypes.INTEGER,
        showing: DataTypes.INTEGER,
        image: DataTypes.STRING,
        description: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Book',
    });

    return Book;
};
