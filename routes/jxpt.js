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
router.get('/jxpt', function(req, resp, next) {
  var num = req.query.number;
  var jxpt_cookie;
  var url = "http://jxpt.cuit.edu.cn/eol";
  var code = 200;
  var message = "success";
  superagent.get(url)
    .charset("gbk")
    .end((err, res) => {
      if(!res){
      sendErrorMessage(resp);
      return ;
      }
    // jxpt_cookie = res.headers['set-cookie'];
    jxpt_cookie = res.headers['set-cookie'];
    if(jxpt_cookie[0].split(";").length){
      console.log(jxpt_cookie[0].split(";")[0]);
      jxpt_cookie = jxpt_cookie[0].split(";")[0];
      }else{
        console.log(jxpt_cookie[0]);
        jxpt_cookie = '';
      }
    var url = "http://jxpt.cuit.edu.cn/eol";
    var code = 200;
    var message = "success";
    superagent.get(url)
      .charset("gbk")
      .set("Cookie",jxpt_cookie)
      .end((err, res) => {
        if(!res){
        sendErrorMessage(resp);
        return ;
        }
      // jxpt_cookie = res.headers['set-cookie'];
      var url = "http://jxpt.cuit.edu.cn/eol/index.jsp?_style=style_2_03 ";
      var code = 200;
      var message = "success";
      superagent.get(url)
        .charset("gbk")
        .set("Cookie",jxpt_cookie)
        .end((err, res) => {
          if(!res){
          sendErrorMessage(resp);
          return ;
          }
    // jxpt_cookie = res.headers['set-cookie']
        var url = "http://jxpt.cuit.edu.cn/eol/homepage/common/";
        var code = 200;
        var message = "success";
        superagent.get(url)
          .charset("gbk")
          .set("Cookie",jxpt_cookie)
          .end((err, res) => {
            if(!res){
            sendErrorMessage(resp);
            return ;
            }
          var $ = cheerio.load(res.text);
          $(".schoolinfo-content input").each(function(i,ele){
              var name = $(this).attr("id");
              var newName = name.substring(0,3);
              // console.log(name);
              // console.log(newName);
              var url = "http://jxpt.cuit.edu.cn/eol/common/ckeditor/content.html?name="+newName; 
              // console.log(url);
              superagent.get(url)
                .charset("gbk")
                .set("Cookie",jxpt_cookie)
                .end((err, res) => {
                  if(!res){
                  sendErrorMessage(resp);
                  return ;
                  }
                var url = "http://jxpt.cuit.edu.cn/eol/homepage/common/login.jsp ";
                var code = 200;
                var message = "success";
                var postData  = "IPT_LOGINUSERNAME="+num+"&IPT_LOGINPASSWORD="+num;
                superagent.post(url)
                  .charset("gbk")
                  .send(postData)
                  .set("Cookie",jxpt_cookie)
                  .end((err, res) => {
                	 if(!res){
                    sendErrorMessage(resp);
                    return ;
                  }
                  // console.log(res.text);
                  // console.log(jxpt_cookie);
                  var $ = cheerio.load(res.text);
                  var url = "http://jxpt.cuit.edu.cn/eol/homepage/common/index.jsp ";
                  superagent.get(url)
                    .charset("gbk")
                    .set("Cookie",jxpt_cookie)
                    .end((err, res) => {
                      if(!res){
                      sendErrorMessage(resp);
                      return ;
                      }
            // console.log(res.text);
            // var cookie = res.headers['set-cookie'];
            // console.log(cookie);
            // if(jxpt_cookie[0].split(";").length){
            //   console.log(jxpt_cookie[0].split(";")[0]);
            //   jxpt_cookie = jxpt_cookie[0].split(";")[0];
            //   }else{
            //     console.log(jxpt_cookie[0]);
            //     jxpt_cookie = '';
            // }
                    var $ = cheerio.load(res.text);
                    $(".schoolinfo-content input").each(function(i,ele){
                      var name = $(this).attr("id");
                      var newName = name.substring(0,3);
                      // console.log(name);
                      // console.log(newName);
                      var url = "http://jxpt.cuit.edu.cn/eol/common/ckeditor/content.html?name="+newName; 
                      // console.log(url);
                      superagent.get(url)
                        .charset("gbk")
                        .set("Cookie",jxpt_cookie)
                        .end((err, res) => {
                          if(!res){
                          sendErrorMessage(resp);
                          return ;
                          }
                // console.log(res.text);
                // jxpt_cookie = res.headers['cookie'];
                        var $ = cheerio.load(res.text);
                        var url = "http://jxpt.cuit.edu.cn/eol/main.jsp";
                        superagent.get(url)
                          .charset("gbk")
                          .set("Cookie",jxpt_cookie)
                          .end((err, res) => {
                            if(!res){
                            sendErrorMessage(resp);
                            return ;
                            }
                          console.log(res.text);
                          var $ = cheerio.load(res.text);
                          var j = 0;
                          var data1 = {};
                          var data2 = {};
                          var data3 = {};
                          var data4 = {};
                          var datas = {code,message,data1,data2,data3,data4};
                          console.log(datas);
                          resp.send(datas);
                          })
                        })
                    })
                  })
                })
              })
            })
          })
        })
    })
          // $(".container-rectangle-long a").each(function(i,ele){
          //   var text  = $(this).attr("title");
          //   var url  = "http://jsjxy.cuit.edu.cn/" + $(this).attr("href");
          //   if(text){
          //     data1[j] ={
          //       title : "焦点新闻",
          //       text : text,
          //       url : url
          //     }
          //     j++;
          //   }
          // })
          // j = 0;
          // $(".container-rectangle a").each(function(i,ele){
          //   var text  = $(this).attr("title");
          //   var url  = "http://jsjxy.cuit.edu.cn/" + $(this).attr("href");
          //   if(text){
          //     data2[j] ={
          //       title : "综合新闻",
          //       text : text,
          //       url : url
          //     }
          //     j++;
          //   }
          // })
          // j = 0;
          // $(".container-rectangle-note a").each(function(i,ele){
          //   var text  = $(this).attr("title");
          //   var url  = "http://jsjxy.cuit.edu.cn/" + $(this).attr("href");
          //   data3[j] ={
          //     title : "通知公告",
          //     text : text,
          //     url : url
          //   }
          //   j++;
          // })
          // $("#hlFocus").each(function(i,ele){
          // var text  = $(this).text();
          // var url  = "http://www.cuit.edu.cn/" + $(this).attr("href");
          // data4[i] ={
          //   title : "焦点新闻",
          //   text : text,
          //   url : url
          // }
          // i++;
          // })
    })
});

  //去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;