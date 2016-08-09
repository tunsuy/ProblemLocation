var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// require('./helper/limitUserInput');
// require('./helper/uiCheck');
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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
