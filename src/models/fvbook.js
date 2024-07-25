'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FvBook extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    FvBook.init({
       idusername : DataTypes.INTEGER,
       idfvbook : DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'FvBook',
    });

    return FvBook;
};
