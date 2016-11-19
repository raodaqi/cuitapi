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
router.get('/dropBox', function(req, resp, next) {
  dropBox(req,resp,next);
});

function dropBox(req,resp,next) {
  var wlcc_cookie;
  var url = "http://pan.cuit.edu.cn";
  var tourl;
  var code = 200;
  var message = "success";
  superagent.get(url)
    .charset("utf-8")
    .end((err, res) => {
    	 if(!res){
        sendErrorMessage(resp);
        return ;
      }
      // console.log(res.text);
      wlcc_cookie = res.headers['set-cookie'];
      if(wlcc_cookie[0].split(";").length){
        console.log(wlcc_cookie[0].split(";")[0]);
        wlcc_cookie = wlcc_cookie[0].split(";")[0];
      }else{
        console.log(wlcc_cookie[0]);
        wlcc_cookie = '';
      }
      console.log(wlcc_cookie);
      var url = "http://pan.cuit.edu.cn/home/disk/";
      superagent.get(url)
      .charset("utf-8")
      .set("Cookie",wlcc_cookie)
      .end((err, res) => {
       if(!res){
        sendErrorMessage(resp);
        return ;
      }
      // console.log(res.text);
      var $ = cheerio.load(res.text);
      $("#credentials").each(function(i,ele){
        tourl = $(this).attr("action");
        console.log(tourl);
      })
      // console.log(resp);
      getItKey('',{success:function(ltKey,wlcc_cookie){
        // console.log(wlcc_cookie);  
          // req.session.ltKey = ltKey;
          console.log(ltKey);
          // var url = "http://uia.cuit.edu.cn"+tourl;
          var url = "http://uia.cuit.edu.cn/sso/login;jsessionid=488FE026C9A3D7AF6711D500CF71D524?service=http%3a%2f%2fpan.cuit.edu.cn%2fauth%2fsso%2fcallback";
          var postData  = "username=2014051064&password=Zys319716&lt="+ltKey+"&_eventId=submit";
          superagent.post(url)
          .send(postData)
          .set("Cookie",wlcc_cookie) 
          // .set('Referer', 'http://uia.cuit.edu.cn/sso/login?service=http%3a%2f%2fpan.cuit.edu.cn%2fauth%2fsso%2fcallback') 
          .charset("utf-8")
          .end((err, res) => {
          wlcc_cookie = res.headers['set-cookie'];
            // console.log(res.text);
            var url = "http://pan.cuit.edu.cn/auth/sso/callback?ticket=ST-28060-zKYkqCzmhqeFQyqwwfA6-UIA";
            superagent.get(url)
            .end((err, res) => {
              console.log(res.text);
            })
              // $(".k-selectable a").each(function(i,ele){
              //   var text  = $(this).attr("title");
              //   var url  = "http://jsjxy.cuit.edu.cn/" + $(this).attr("href");
              //   if(text){
              //     data1[j] ={
              //     title : "焦点新闻",
              //     text : text,
              //     url : url
              //   }
              //   j++;
              //   }
              // })
          }) 
        },
         error:function(){
      }
      })
        // console.log(res.text);
        // var wlcc_cookie = res.headers['set-cookie'];
        var $ = cheerio.load(res.text);
          var i = 0;
          var data1 = {};
          var data2 = {};
          var data3 = {};
          var data4 = {};
          var datas = {code,message,data1,data2,data3,data4};
          console.log(datas);
        resp.send(datas);
      })
      
    })
  }

router.get('/getItKey', function(req, res, next) {
  getItKey('',{
    success:function(ltKey){
      // sendSuccessMessage(res,code);
      var result = {
        code:200,
        message:"success",
        key:ltKey
      }
      res.send(result);
    },
    error:function(error){
      sendErrorMessage(res,error);
    }
  });
});

function getItKey(cookie,callback){
  var url = "http://uia.cuit.edu.cn/sso/login?service=http%3a%2f%2fpan.cuit.edu.cn%2fauth%2fsso%2fcallback";
  superagent.get(url)
    .charset("utf-8")
    .end((err, res) => {
       if(!res){
        sendErrorMessage(resp);
        return ;
      }
      var wlcc_cookie = res.headers['set-cookie'];
      console.log(wlcc_cookie);
      var $ = cheerio.load(res.text);
      var ltKey = $("input[name=lt]").val();
      console.log(ltKey);
      if(ltKey){
        callback.success(ltKey,wlcc_cookie);
      }else{
        callback.error($("body").text(),wlcc_cookie);
      }
    })
}

function sendErrorMessage(res,message){
  var result = {
    code:500,
    messageDetail:message,
    data:{}
  }
  res.send(result);
}

  //去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router; 