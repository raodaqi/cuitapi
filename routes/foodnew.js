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
router.get('/foodNew', function(req, resp, next) {
  foodNew(resp);
});

function foodNew(resp) {
  var url = "http://m.zhms.cn/Service.asp?showNum=4&bigTypeId=2&smallTypeId=0&specialId=0&isRecommend=1&isHit=0&isImg=1&curPage=3&queryType=showList";
  var code = 200;
  var message = "success";
  superagent.get(url)
    .charset("utf-8")
    .end((err, res) => {
    	 if(!res){
        sendErrorMessage(resp);
        return ;
      }
        console.log(res.text);
        var $ = cheerio.load(res.text);
        var str = res.text;
        if(str[0].split("'").length){
        console.log(str[0].split("'")[0]);
        str = str[0].split("'")[0];
      }
      console.log(str);
        var s = encodeURI('http:\/\/p2.zhms.cn\/2016-07\/201607281644081026.png');
        console.log(s);
          // var datas = {code,message,data1,data2,data3,data4};
          // console.log(datas);
          var datas = "";
        resp.send(datas);
    })
  }
  //去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;