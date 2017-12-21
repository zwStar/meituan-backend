import express from 'express';
import db from './mongodb/db.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import connectMongo from 'connect-mongo';
import bodyParser from 'body-parser'
// import history from 'connect-history-api-fallback';
import config from './config'
const app = express();

app.all('*', (req, res, next) => {
    console.log(req.headers.origin)
    res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true); //可以带cookies
    res.header("X-Powered-By", '3.2.1')
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

const MongoStore = connectMongo(session);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({}));
app.use(cookieParser());
app.use(session({
    name: 'mt-session',
    secret: 'meituan',
    resave: true,
    saveUninitialized: false,
    ookie: {
        httpOnly: true,
        secure: false,
        maxAge: 365 * 24 * 60 * 60 * 1000,
    },
    store: new MongoStore({
        url: 'mongodb://123.207.34.129:27017/mt-session'
    })
}))


router(app);

// app.use(history());

app.listen(config.port);

module.export = app;
