import express from "express";
import bodyParser from "body-parser";
import initWebRoute from "./route/web";
import connectDB from "./config/connectDB";
import cors from 'cors';
import Sequelize from 'sequelize';
import mysql2 from 'mysql2';


require('dotenv').config();

 // Needed to fix sequelize issues with WebPack

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    dialectModule: mysql2, // Needed to fix sequelize issues with WebPack
    host: process.env.DB_HOST,
    port: process.env.PORT
  }
)

export async function connectToDatabase() {
  console.log('Trying to connect via sequelize')
  await sequelize.sync()
  await sequelize.authenticate()
  console.log('=> Created a new connection.')

  // Do something 
}


let app = express();

// Sử dụng cors middleware để kích hoạt CORS
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

initWebRoute(app);

connectDB();

let port = process.env.PORT ||8000;
app.listen(port, () => {
    console.log("Backend nodejs is running on port", +port);
});