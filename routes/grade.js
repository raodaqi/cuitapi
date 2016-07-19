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
charset(superagent);

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象

// 查询 Todo 列表
router.get('/', function(req, resp, next) {

  var time = new Date().getTime();
  var url = "http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k=31163&t="+time;
  superagent.get(url)
    .set("Referer", "http://210.41.224.117/Login/xLogin/Login.asp")
    .set("Accept", "image/webp,image/*,*/*;q=0.8")
    // .set("Content-Type","image/bmp")
    // .charset('base64')
    .accept('image/webp,image/*,*/*;q=0.8')
    .end((err, res) => {
      // console.log(res.text);
      if(res.statusCode == 200){
        console.log(res.text);
        var data = new Buffer(res.text, 'binary').toString('base64');
        // resp.send("<img src=data:text/html;base64,"+res.text+"/>");
        console.log(data);
        resp.send("<img src='data:text/html;base64,"+data+"'/>");
      }else{
        res.send(err);
      }
    });
});

router.get('/getvfcode', function(req, res, next) {
  getCodeKey({
    success:function(code){
      getJWCVfCode(code,{
        success:function(data){
          // res.send("<img src="+data+"/>");
          sendSuccessMessage(res,data);
        },
        error:function(error){
          sendErrorMessage(res,error);
        }
      })
    },
    error:function(error){
      sendErrorMessage(res.error);
    }
  });
  // getJWCVfCode({
  //   success:function(data){
  //     // res.send("<img src="+data+"/>");
  //     sendSuccessMessage(res,data);
  //   },
  //   error:function(error){
  //     sendErrorMessage(res,error);
  //   }
  // })
});

router.get('/getcodekey', function(req, res, next) {
  getCodeKey({
    success:function(code){
      // sendSuccessMessage(res,code);
      var result = {
        code:200,
        message:"success",
        key:code
      }
      res.send(result);
    },
    error:function(error){
      sendErrorMessage(res,error);
    }
  });
});

function JWCLogin(){
  var url = "http://210.41.224.117/Login/xLogin/Login.asp";
  // AV.Cloud.httpRequest({
  //   method: 'POST',
  //   url: url,
  //   headers: headers,
  //   body: send,
  //   success:function(httpResponse){
  //     // console.log(httpResponse);
  //     callback.success(httpResponse.text,httpResponse.headers['set-cookie']);
  //   },
  //   error:function(error){
  //     callback.success(error);
  //   }
  // })
}


function getCodeKey(callback){
  var url = 'http://210.41.224.117/Login/xLogin/Login.asp';
  superagentUrlData('',url,'',{
    success:function(body){
      console.log(body);
      // var $ = cheerio.load(res.text);
      var $ = cheerio.load(body);
      var codeKey = $("input[name=codeKey]").val();
      console.log(codeKey);
      if(codeKey){
        callback.success(codeKey);
      }else{
        callback.error($("body").text());
      }
    },
    error:function(error){
      console.log(error);
    }
  })
}

function getJWCVfCode(code,callback){
  var time = new Date().getTime();
  var code = code ? code : "31163";
  var url = "http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k="+code+"&t="+time;
  superagent.get(url)
    .set("Referer", "http://210.41.224.117/Login/xLogin/Login.asp")
    .set("Accept", "image/webp,image/*,*/*;q=0.8")
    .accept('image/webp,image/*,*/*;q=0.8')
    .end((err, res) => {
      if(res.statusCode == 200){
        console.log(res.text);
        var data = new Buffer(res.text, 'binary').toString('base64');
        console.log(data);
        var data = "data:text/html;base64,"+data;
        callback.success(data);
        // resp.send("<img src='data:text/html;base64,"+data+"'/>");
      }else{
        callback.error(err);
      }
    });
}

function sendSuccessMessage(res,data){
  var result = {
    code:200,
    message:"success",
    data:data
  }
  res.send(result);
}
function sendErrorMessage(res,message){
  var result = {
    code:500,
    messageDetail:message,
    data:{}
  }
  res.send(result);
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


function getUrlData(url,charset,callback){
  http.get(url, function(res) {
      var source = "";
      res.setEncoding('binary');
      res.on('data', function(data) {
          source += data;
      });
      res.on('end', function() {
          var buf = new Buffer(source, 'binary');
          if(!charset){
            charset = "GBK";
          }
          var str = iconv.decode(buf, charset);
          callback.success(str);
      });
  }).on('error', function(error) {
      callback.error("error");
      console.log(error);
  });
}

function requestUrlData(cookie,url,charset,callback){
  var j = request.jar();
  var cookie = request.cookie(cookie);
  j.setCookie(cookie, url);
  // request({url: url, jar: j}, function (error, res, body) {
  //   res.setEncoding('binary');
  //   var buf = new Buffer(body, 'binary');
  //   var str = iconv.decode(buf, "gb2312");
  //   console.log(body);
  //   console.log(iconv.decode(body, 'GBK'));
  // })
  http.get(url, function(res) {
      var source = "";
      res.setEncoding('binary');
      var headers=res.headers;  
      //console.log(headers);  
      var cookies=cookie;  
      cookies.forEach(function(cookie){  
          console.log(cookie);  
      });

      res.on('data', function(data) {
          source += data;
      });
      res.on('end', function() {
          var buf = new Buffer(source, 'binary');
          if(!charset){
            charset = "GBK";
          }
          var str = iconv.decode(buf, charset);
          console.log(str);
          // callback.success(str);
      });
  }).on('error', function(error) {
      callback.error("error");
      console.log(error);
  });
}

function superagentUrlData(cookie,url,charset,callback){
  if(cookie){
    superagent.get(url)
    .charset('gbk')
    .set("Cookie",cookie)
    .end((err, res) => {
      // console.log(res.text);
      if(res.statusCode == 200){
        callback.success(res.text);
      }else{
        callback.error(res.text);
      }
    });
  }else{
    superagent.get(url)
    .charset('gbk')
    .end((err, res) => {
      // console.log(res.text);
      if(res.statusCode == 200){
        callback.success(res.text);
      }else{
        callback.error(res.text);
      }
    });
  }
 
}

//获取课程
function superagentGetClass(cookie,url,charset,send,callback){
  superagent.post(url)
    .send(send)
    .charset(charset)
    .set("Cookie",cookie)
    .end((err, res) => {
      if(res.statusCode == 200){
        console.log(res.text);
        var $ = cheerio.load(res.text);
        //解析出方式一的链接
        // console.log();
        console.log($("a").attr("href"));
        var url = 'http://pkxt.cuit.edu.cn/'+$("a").attr("href");
        console.log(url);
        if(!$("a").attr("href") || $("a").attr("href") == "undefined"){
          var error = $("font").text();
          console.log(error);
          callback.error(leaveBlank(error));
        }
        superagentUrlData(cookie,url,"",{
          success:function(body){
            callback.success(body);
          },
          error:function(error){
            var result = {
              code:'600',
              message:'获取课表失败'
            }
            // res.send(result);
          }
        }); 
      }else{
        callback.error(res.text);
      }
    });
}

function postUrlData(url,send,headers,callback){
  AV.Cloud.httpRequest({
    method: 'POST',
    url: url,
    headers: headers,
    body: send,
    success:function(httpResponse){
      // console.log(httpResponse);
      callback.success(httpResponse.text,httpResponse.headers['set-cookie']);
    },
    error:function(error){
      callback.success(error);
    }
  })
}

function getClassTB(res){
  getUrlData("http://pkxt.cuit.edu.cn/login.asp","",{
    success:function(data){
      // console.log(data);
      // res.send(data);
    },
    error:function(error){
      console.log(error);
      res.send(error);
    }
  });
}

//只是模拟登录
function classTBOnlyLogin(res,postData,callback){
  var postData = postData ? postData:"user=guest&passwd=guest&B1=%CC%E1+%BD%BB";
  var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36 Content-Type: application/x-www-form-urlencoded'
  }
  postUrlData("http://pkxt.cuit.edu.cn/showfunction.asp",postData,headers,{
    success:function(data,cookie){
      if(cookie[0].split(";").length){
        console.log(cookie[0].split(";")[0]);
        cookie = cookie[0].split(";")[0];
        callback.success(cookie);
      }else{
        console.log(cookie[0]);
        cookie = '';
        callback.error("error");
      }
    },
    error:function(error){
      console.log(error);
      res.send(error);
    }
  });
}

//课表模拟登录界面
function classTBLogin(res,postData,sendData){
  var postData = postData ? postData:"user=guest&passwd=guest&B1=%CC%E1+%BD%BB";
  // var postData = {
  //   user:'guest',
  //   passwd : 'guest'
  // }
  var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36 Content-Type: application/x-www-form-urlencoded'
  }
  postUrlData("http://pkxt.cuit.edu.cn/showfunction.asp",postData,headers,{
    success:function(data,cookie){
      // console.log(data);
      // console.log(cookie);
      if(cookie[0].split(";").length){
        console.log(cookie[0].split(";")[0]);
        cookie = cookie[0].split(";")[0];
      }else{
        console.log(cookie[0]);
        cookie = '';
      }
      if(cookie){
        // requestUrlData()
        if(sendData){
          var depart     = sendData.depart,
              pro        = sendData.pro,
              grade      = sendData.grade,
              sendClass  = sendData.sendClass;
        }else{
          var depart     = "计算机学院",
              pro        = "计算机科学本科(计工)",
              grade      = "2013级",
              sendClass  = "02班";
        }
        

        //这里有一个坑，js的urlencode分了三种
        /**
          escape() 窍门：
          采用ISO Latin字符集对指定的字符串停止编码。所有的空格符、标点符号、特殊字符以及更多有联系非ASCII字符都将被转化成%xx各式的字符编码（xx等于该字符在字符集表里面的编码的16进制数字）。比如，空格符对应的编码是%20。
          不会被此窍门编码的字符： @ * / +
          encodeURI() 窍门：
          把URI字符串采用UTF-8编码各式转化成escape各式的字符串。
          不会被此窍门编码的字符：! @ # $& * ( ) = : / ; ? + '
          encodeURIComponent() 窍门：
          把URI字符串采用UTF-8编码各式转化成escape各式的字符串。与encodeURI()相比，那个窍门将对更多的字符停止编码，比如 / 等字符。所以假如字符串里面包含了URI的几个部份的话，别用那个窍门来停止编码，否则 / 字符被编码之后URL将呈现错误。
          不会被此窍门编码的字符：! * ( ) '
        **/
        depart = iconv.encode(depart, 'GB2312').toString('binary');
        depart = escape(depart);
        pro = iconv.encode(pro, 'GB2312').toString('binary');
        pro = escape(pro);
        grade = iconv.encode(grade, 'GB2312').toString('binary');
        grade = escape(grade);
        sendClass = iconv.encode(sendClass, 'GB2312').toString('binary');
        sendClass = escape(sendClass);
        var send = {
          mode   : "1",
          depart : depart,
          pro    : pro,
          grade  : grade,
          class  : sendClass
        }
        // var send = {
        //   mode   : "1",
        //   depart : '%BC%C6%CB%E3%BB%FA%D1%A7%D4%BA',
        //   pro    : '%BC%C6%CB%E3%BB%FA%BF%C6%D1%A7%B1%BE%BF%C6%28%BC%C6%B9%A4%29',
        //   grade  : '2013%BC%B6',
        //   class  : '02%B0%E0'
        // }
        var send = 'mode=1&depart='+depart+'&pro='+pro+'&grade='+grade+'&class='+sendClass;
        // var send = 'mode=1&depart=%C2%BC%C3%86%C3%8B%C3%A3%C2%BB%C3%BA%C3%91%C2%A7%C3%94%C2%BA&pro=%C2%BC%C3%86%C3%8B%C3%A3%C2%BB%C3%BA%C2%BF%C3%86%C3%91%C2%A7%C2%B1%C2%BE%C2%BF%C3%86(%C2%BC%C3%86%C2%B9%C2%A4)&grade=2013%C2%BC%C2%B6&class=02%C2%B0%C3%A0'
        // var send = 'mode=1&depart=%BC%C6%CB%E3%BB%FA%D1%A7%D4%BA&pro=%BC%C6%CB%E3%BB%FA%BF%C6%D1%A7%B1%BE%BF%C6%28%BC%C6%B9%A4%29&grade=2013%BC%B6&class=02%B0%E0';
        // depart = iconv.encode(send.depart, 'gb2312');
        // var send = iconv.encode(send, 'gbk').toString('binary');
        // send = JSON.stringify(send);
        console.log(send);
        // superagentUrlData(cookie,"http://pkxt.cuit.edu.cn/classtb.asp","");
        superagentGetClass(cookie,"http://pkxt.cuit.edu.cn/showclasstb.asp","gbk",send,{
          success:function(body){
            var body = formatTable(body);
            console.log(body);
            var result = {
              code           : 200,
              message        : 'success',
              classTableData : body
            }
            res.send(result);
          },
          error:function(error){
            console.log(error);
            sendErrorMessage(res,error);
          }
        });
      }
      // res.send(data);
    },
    error:function(error){
      console.log(error);
      res.send(error);
    }
  });
}

//解析获取到的课表信息
function formatTable(body){
  // console.log(body);
  var $ = cheerio.load(body);
  //解析出方式一的链接
  // console.log($("table")[1].text());
  var classTableDate = {
  }
  var type = [],
      mon  = [],
      tue  = [],
      wed  = [],
      thu  = [],
      fri  = [];
  var j = 0;
  $("tr").each(function(i,ele){
    // console.log(i);
    /*这里是解析课表信息
      前两个是班级和班主任
      最后一个是备注
    */
    if(i==0){
      console.log(leaveBlank($(this).text()));
      classTableDate.className = leaveBlank($(this).text()); 
    }else if(i == 1){
      console.log(leaveBlank($(this).text()));
      classTableDate.counsellor = leaveBlank($(this).text()); 
    }else if(i == 8){
      console.log(leaveBlank($(this).text()));
      classTableDate.remarks = leaveBlank($(this).text()); 
    }else{
      // console.log($(this).find("td"));
      // console.log(j);
      $(this).find("td").each(function(i,ele){
        if(j > 0){
          switch(i){
            case 0:
              type[j-1] = leaveBlank($(this).text());
              break;
            case 1:
              mon[j-1] = leaveBlank($(this).text());
              break;
            case 2:
              tue[j-1] = leaveBlank($(this).text());
              break;
            case 3:
              wed[j-1] = leaveBlank($(this).text());
              break;
            case 4:
              thu[j-1] = leaveBlank($(this).text());
              break;
            case 5:
              fri[j-1] = leaveBlank($(this).text());
              break;
          }
        }
      })
      j++;
    }
  })
  // console.log(JSON.stringify(tue));
  classTableDate.type = type;
  classTableDate.mon = mon;
  classTableDate.tue = tue;
  classTableDate.wed = wed;
  classTableDate.thu = thu;
  classTableDate.fri = fri;
  // console.log(classTableDate);
  return classTableDate;
}

//去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

module.exports = router;