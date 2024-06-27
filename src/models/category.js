'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Category.hasMany(models.Book, { foreignKey: 'category', as: 'Data' });
        }
    };

    Category.init({
        category: {
            type: DataTypes.STRING,
            field: 'category'
        }
    }, {
        sequelize,
        modelName: 'Category',
        freezeTableName: true, // Tùy chọn này sẽ giữ nguyên tên bảng
        timestamps: false // Nếu bạn không muốn sử dụng các cột thời gian mặc định
    });

    return Category;
};
