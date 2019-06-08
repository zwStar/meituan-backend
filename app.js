import express from 'express';
import './mongodb/db.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import connectMongo from 'connect-mongo';
import bodyParser from 'body-parser'
import multer from 'multer';
// import history from 'connect-history-api-fallback';
import config from './config'
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload_imgs')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
});

let upload = multer({storage: storage});


app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", true); //可以带cookies
  res.header("X-Powered-By", '3.2.1');
  res.header("Cache-Control", "public,max-age=60000");
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

const MongoStore = connectMongo(session);
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json({}));
app.use(cookieParser());
app.use(session({
  name: 'mt-session',
  secret: 'meituan',
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
  store: new MongoStore({
    url: config.sessionStorageURL
  })
}));
router(app);
// app.use(history());
console.log('*********************************')
console.log(`service start on ${config.port}`)
console.log('*********************************')
app.listen(config.port);

module.exports = app;
