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
function sendErrorMessage(res,message){
  var result = {
    code:500,
    message:"加载失败"
  }
  res.send(result);
}
router.get('/xgNew', function(req, resp, next) {
  xgNew(resp);
});

function xgNew(resp) {
  var url = "http://xsc.cuit.edu.cn/WebSite/web/default.html";
  var code = 200;
  var message = "success";
  superagent.get(url)
    .charset("gbk")
    .end((err, res) => {
    	 if(!res){
        sendErrorMessage(resp);
        return ;
      }
        var $ = cheerio.load(res.text);
          var i = 0;
          var data1 = {};
          var data2 = {};
          var data3 = {};
          var data4 = {};
          var length;
          var j = 0;
          $("#XGYW a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://xsc.cuit.edu.cn/WebSite/web/" + $(this).attr("href");
          data1[j] ={
            title : "学工要闻",
            text : text,
            url : url
          }
          j++;
          })
          length = j;
          data1 = {data1,length};
          var j = 0;
          $("#YXDT a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://xsc.cuit.edu.cn/WebSite/web/" + $(this).attr("href");
          data2[j] ={
            title : "学院动态",
            text : text,
            url : url
          }
          j++;
          })
          length = j;
          data2 = {data2,length};
          var j = 0;
          $("#QCBY a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://xsc.cuit.edu.cn/WebSite/web/" + $(this).attr("href");
          data3[j] ={
            title : "青春榜样",
            text : text,
            url : url
          }
          j++;
          })
          length = j;
          data3 = {data3,length};
          var j = 0;
          $("#ZTHD a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://xsc.cuit.edu.cn/WebSite/web/" + $(this).attr("href");
          data4[j] ={
            title : "专题活动",
            text : text,
            url : url
          }
          j++;
          })
          length = j;
          data4 = {data4,length};
          var datas = {code,message,data1,data2,data3,data4};
          console.log(datas);
        resp.send(datas);
    })
  }
  //去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;