var router = require('express').Router();
var AV = require('leanengine');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var http =  require('http');
var qs = require('querystring');
// var cookieParser = require('cookie-parser');
var request = require('request');
var charset = require('superagent-charset');
var superagent = require('superagent');
// charset(superagent);

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象

// 查询 Todo 列表
router.get('/', function(req, resp, next) {
  var url = "http://www.cuit.edu.cn/NewsList?id=1";
  superagent.get(url)
    .end((err, res) => {
      console.log(res.text);
        console.log(res.text);
        var $ = cheerio.load(res.text)
          var i = 0;
          var data = {};
          $("#NewsListContent li a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://www.cuit.edu.cn/" + $(this).attr("href");
          data[i] ={
            text : text,
            url : url
          }
          i++;
          })
          console.log(data);
        resp.send(res.text);
    });
});

function getNews(req, resp, next) {
  var url = "http://www.cuit.edu.cn/NewsList?id=1";
  superagent.get(url)
    .end((err, res) => {
      console.log(res.text);
        console.log(res.text);
        var $ = cheerio.load(res.text)
          var i = 0;
          var data = {};
          $("#NewsListContent li a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://www.cuit.edu.cn/" + $(this).attr("href");
          data[i] ={
            text : text,
            url : url
          }
          i++;
          })
          console.log(data);
        resp.send(data);
    })
  }


// 新增 Todo 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.save(null, {
    success: function(todo) {
      res.redirect('/todos');
    },
    error: function(err) {
      next(err);
    }
  })
})

router.get('/getNew', function(req, res, next) {
  var type = req.query.type;
  if(type == 1){
    var send = '__EVENTTARGET=lbtnPrev&txtKeyWords=txtKeyWords&hfNtId=1';
  } 
  else if(type == 2){
    var send ='__EVENTTARGET=lbtnNext&txtKeyWordstxtKeyWords&hfNtId=1';
  }
  else if(type == 3){
    var page = $("#labCount").text();
    var send = 'txtKeyWords=站内搜索&hfNtId=1&btnPage=GO&txtPage='+page;
  }
  superagentGetNews(res,"http://www.cuit.edu.cn/NewsList?id=1",'',send);
});

//获取课程
function superagentGetNews(url,charset,send,callback){
  superagent.post(url)  
    .send(send)
    .charset(charset)
    .end((err, res) => {
        console.log(res.text);
        var $ = cheerio.load(res.text);
        // 解析出方式一的链接
        var i = 0;
          var data = {};
          $("#NewsListContent li a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://www.cuit.edu.cn/" + $(this).attr("href");
          data[i] ={
            text : text,
            url : url
          }
          i++;
          })
          console.log(data);
        res.send(data);
    })
}

//去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;
