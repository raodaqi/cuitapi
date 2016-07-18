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
function sendErrorMessage(res,message){
  var result = {
    code:500,
    message:"加载失败"
  }
  res.send(result);
}
router.get('/btMovies', function(req, resp, next) {
  btMovies(resp);
});

function btMovies(resp){
  var url = "http://www.bttiantang.com/";
  var code = 200;
  var message = "success";
  superagent.get(url)
    .end((err, res) => {
    	 if(!res){
        sendErrorMessage(resp);
        return ;
      }
        // console.log(res.text);
        var $ = cheerio.load(res.text);
        var i = 0;
        data = {};
        $(".item").each(function(i,ele){
          // var time = $(".tt span").text();
          var time = $(this).find(".tt").find("span").text();
          var url  = "http://www.bttiantang.com/" + $(this).find(".tt").find("a").attr("href");
          var name = $(this).find(".tt").find("a").text();
          var anothername = $(this).find(".tt").next().find("a").text();
          var detail = $(this).find(".des").text();
          var score = leaveBlank($(this).find(".rt").text());
          var img = "http://www.bttiantang.com" + $(this).find(".litpic a").attr("href");
          data[i] ={
            name: name,
            anothername:anothername,
            time: time,
            url: url,
            detail: detail,
            score: score,
            img: img
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