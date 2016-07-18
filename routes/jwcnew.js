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
router.get('/jwcNews', function(req, resp, next) {
  jwcNews(resp);
});

function jwcNews(resp) {
  var url = "http://jwc.cuit.edu.cn/";
  var code = 200;
  var message = "success";
  superagent.get(url)
    .end((err, res) => {
        // console.log(res.text);
        var $ = cheerio.load(res.text);
          var i = 0;
          var data = {};
          $(".col_5 a").each(function(i,ele){
          var text  = $(this).text();
          var url  = "http://jwc.cuit.edu.cn" + $(this).attr("href");
          data[i] ={
            text : text,
            url : url
          }
          i++;
          })
          var datas = {code,message,data};
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