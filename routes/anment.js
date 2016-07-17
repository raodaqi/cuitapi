var router = require('express').Router();
var AV = require('leanengine');
var cheerio = require('cheerio');
// var iconv = require('iconv-lite');
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
router.get('/getNews', function(req, resp, next) {
  getNews(resp);
});

function getNews(resp) {
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
// type == 1 :上一页
// type == 2 :下一页 
// type == 3 :跳转到某页
// type == 4 :首页
// type == 5 :尾页
router.get('/getNew', function(req, resp, next) {
  var type = req.query.type;
  var num = req.query.num;
  var url = "http://www.cuit.edu.cn/NewsList.aspx?id=1";
  superagent.get(url)
  .end((err, res) => {
      // console.log(res.text);
        // console.log(res.text);
        var $ = cheerio.load(res.text)
        var val = $("#__EVENTVALIDATION").val();
        var view = $("#__VIEWSTATE").val();
        console.log(val);
         if(type == 1){
    var send = 'page={4}&value=%value%';
  } 
  else if(type == 2){
    var send ='__EVENTVALIDATION='+val;
  }
  else if(type == 3){     
    var send = 'txtPage='+num+'&__EVENTVALIDATION='+val;   
    // console.log(12334);
    // console.log(send);
  }
  else if(type == 4){
    var send = '__EVENTVALIDATION='+val;
  }
  else if(type == 5){
    var send = '__EVENTVALIDATION='+val;
  }
  // console.log(type);
  superagentGetNews("http://www.cuit.edu.cn/NewsList.aspx?id=1",'',send,resp);
    })
 
});

//获取课程
function superagentGetNews(url,charset,send,resp){
  superagent.post(url)  
    .send(send)
    .charset(charset)
    .end((err, res) => {
        // console.log(res.text);
        var $ = cheerio.load(res.text);
        // 解析出方式一的链接
        var i = 0;
        var pages = $("#labCount").text();
        var thePage = $("#labCurrentPage").text();
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
          var datas ={pages,thePage,data}
        resp.send(datas);
    })
}

//去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;
