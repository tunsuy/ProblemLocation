//引入中间件
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

//日志模块配置
// var log4js = require('log4js');
// log4js.configure({
//   appenders: [
//     { type: 'console' }, //控制台输出
//     {
//       type: 'file', //文件输出
//       filename: 'logs/access.log', 
//       maxLogSize: 1024,
//       backups:3,
//       category: 'normal' 
//     }
//   ],
//   replaceConsole: true
// });
// var logger = log4js.getLogger('normal');
// logger.setLevel('INFO');
// app.use(log4js.connectLogger(logger, {level: 'auto'}));

//在日志中输出url请求，由于加载顺序的原因，放在其他app.use前面   
var log = require('./helper/log4jsHandle.js');  
log.use(app);  

//session相关中间件
var expressSession = require('express-session');
var redis = require('redis');
var RedisStore = require('connect-redis')(expressSession);
//配置存储
var redisInfo = require("./redis.json");
var redisClient = redis.createClient(
        redisInfo.port,
        redisInfo.host,
        redisInfo.auth
    );
app.use(expressSession({
    name: "cookie_session_id",
    store: new RedisStore({client: redisClient}),
    secret: "ts123",
    cookie: {
        path: '/',
        maxAge: 15*60*1000,
        secure: false,
        httpOnly: true
    },
    rolling: false,
    resave: true,
    saveUninitialized: false
}));

// require('./helper/limitUserInput');
// require('./helper/uiCheck');

//引入路由处理模块
var login = require('./routes/login');
var index = require('./routes/index');
var users = require('./routes/users');
var push = require('./routes/push');
var im = require('./routes/im');
var loginRelate = require('./routes/loginRelate');
var task = require('./routes/task');
var workattendance = require('./routes/workattendance');
var workFlowed = require('./routes/workFlowed');
var workReport = require('./routes/workReport');
var commonTool = require('./routes/commonTool');
var customer = require('./routes/customer');
var cloudDisk = require('./routes/cloudDisk');
var privilege = require('./routes/privilege');
var webapp = require('./routes/webapp');
var legwork = require('./routes/legwork');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//加载中间件：
//  捕获该应用所有的请求，进行相关处理再转发
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置请求路由处理方法
app.use('/',login);
app.use('/index', index);
app.use('/users', users);
app.use('/push',push);
app.use('/im',im);
app.use('/loginRelate',loginRelate);
app.use('/task',task);
app.use('/workattendance',workattendance);
app.use('/workFlowed',workFlowed);
app.use('/workReport',workReport);
app.use('/commonTool',commonTool);
app.use('/customer',customer);
app.use('/cloudDisk',cloudDisk);
app.use('/privilege',privilege);
app.use('/webapp',webapp);
app.use('/legwork',legwork);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
