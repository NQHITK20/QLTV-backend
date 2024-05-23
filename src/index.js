import express from "express";
import bodyParser from "body-parser";
import initWebRoute from "./route/web";
import connectDB from "./config/connectDB";
import cors from 'cors';

require('dotenv').config();

let app = express();

// Sử dụng cors middleware để kích hoạt CORS
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

initWebRoute(app);

connectDB();

let port = "https://qltv-backend.vercel.app/";
app.listen(port, () => {
    console.log("Backend nodejs is running on port", +port);
});