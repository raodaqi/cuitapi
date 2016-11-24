'use strict';
var domain = require('domain');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');
var classtb = require('./routes/classtb');
var grade = require('./routes/grade');
var anment = require('./routes/anment');
var btmovie = require('./routes/btmovie');
var jwcnew = require('./routes/jwcnew');
var xgnew = require('./routes/xgnew');
var indexnew = require('./routes/indexnew');
var jsjnew = require('./routes/jsjnew');
var foodnew = require('./routes/foodnew');
var dropbox = require('./routes/dropbox');
var jxpt = require('./routes/jxpt');
var cloud = require('./cloud');

var app = express();

app.get('/', function(req, res) {
  res.render('newApi', { currentTime: new Date() });
});

//设置跨域访问
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 设置 view 引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// 加载云代码方法
app.use(cloud);

// 使用 LeanEngine 中间件
// （如果没有加载云代码方法请使用此方法，否则会导致部署失败，详细请阅读 LeanEngine 文档。）
// app.use(AV.Cloud);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 未处理异常捕获 middleware
app.use(function(req, res, next) {
  var d = null;
  if (process.domain) {
    d = process.domain;
  } else {
    d = domain.create();
  }
  d.add(req);
  d.add(res);
  d.on('error', function(err) {
    console.error('uncaughtException url=%s, msg=%s', req.url, err.stack || err.message || err);
    if(!res.finished) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json; charset=UTF-8');
      res.end('uncaughtException');
    }
  });
  d.run(next);
});

app.get('/ocr', function(req, res) {
  
  res.render('ocr');
});

app.get('/api', function(req, res) {
  res.render('api', { currentTime: new Date() });
});

app.get('/newApi', function(req, res) {
  res.render('newApi', { currentTime: new Date() });
});

app.get('/btmovies', function(req, res) {
  res.render('btmovies', { currentTime: new Date() });
});

app.get('/signin', function(req, res) {
  res.render('signin', { currentTime: new Date() });
});

app.get('/signup', function(req, res) {
  res.render('signup', { currentTime: new Date() });
});


app.get('/test', function(req, res) {
  res.send("hello");
});
app.post('/test', function(req, res) {
  res.send("hello");
});

// 可以将一类的路由单独保存在一个文件中
app.use('/todos', todos);   
app.use('/classtb', classtb);  //获取班级课表
app.use('/grade', grade);      //获取成绩
app.use('/anment', anment);    
app.use('/btmovie',btmovie);   //获取bt天堂最新电影
app.use('/jwcnew',jwcnew);     //获取教务处新闻
app.use('/xgnew',xgnew);       //获取学工网新闻
app.use('/indexnew',indexnew);  //获取官网首页新闻
app.use('/jsjnew',jsjnew);  //获取计算机学院官网新闻
app.use('/dropbox',dropbox);//获取网络存储
app.use('/foodnew',foodnew);//中华美食网美食信息
app.use('/jxpt',jxpt);//获取教学平台信息
// 如果任何路由都没匹配到，则认为 404
// 生成一个异常让后面的 err handler 捕获
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) { // jshint ignore:line
    var statusCode = err.status || 500;
    if(statusCode === 500) {
      console.error(err.stack || err);
    }
    res.status(statusCode);
    res.render('error', {
      message: err.message || err,
      error: err
    });
  });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function(err, req, res, next) { // jshint ignore:line
  res.status(err.status || 500);
  res.render('error', {
    message: err.message || err,
    error: {}
  });
});

module.exports = app;
