import express from "express";
import bodyParser from "body-parser";
import ViewEngine from "../config/viewEngine";
import initWebRoute from "../route/web";
import connectDB from "../config/connectDB";
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Sử dụng cors middleware để kích hoạt CORS
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

ViewEngine(app);
initWebRoute(app);

connectDB();

// Serve static files for web-ui
app.use('/web-ui', express.static(path.join(__dirname, '..', 'web-ui')));

// Serve static files for admin-ui
app.use('/admin-ui', express.static(path.join(__dirname, '..', 'admin-ui')));

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log("Backend nodejs is running on port", port);
});

export default app;
