'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class News extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    News.init({
    title:DataTypes.STRING,
    description:DataTypes.STRING,
    image:DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    showing: DataTypes.INTEGER,
    publicAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'News',
    });
    return News;
};