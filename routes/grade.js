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
var session = require('express-session');
charset(superagent);

router.use(session({
    secret: '12345',
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 80000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象

// 查询 Todo 列表
router.get('/getvfcode', function(req, resp, next) {
  var type = req.query.type ? req.query.type : 3;
  getCodeKey('',{
    success:function(code,jszx_cookie){
      if(!jszx_cookie){
        var err = {
          code    : 600,
          data    : [],
          message : "啊偶~教务处君忙碌中，请耐心等待"
        }
        res.send(err);
        return;
      }
      req.session.jszx_cookie = jszx_cookie;
      req.session.code = code;
      var time = new Date().getTime();
      var url = "http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k="+code+"&t="+time;
      superagent.get(url)
        .set("Cookie",jszx_cookie)
        .set("Referer", "http://210.41.224.117/Login/xLogin/Login.asp")
        .end((err, res) => {

          if(err){
            var err = {
              code    : 600,
              data    : [],
              message : "获取失败"
            }
            res.send(err);
            return;
          }

          // console.log(res.text);
          if(res.statusCode == 200){
            var data = new Buffer(res.text, 'binary').toString('base64');
            // resp.send("<img src=data:text/html;base64,"+res.text+"/>");
            // data = "data:text/html;base64,"+data;
            // var result = {
            //   data   : data,
            //   code   : 200,
            //   cookie : cookie
            // }
            // resp.send(new Buffer(res.text, 'binary'));
            
            if(type == 1){
              resp.send(new Buffer(res.text, 'binary'));
            }else if(type == 2){
              var result = {
                data    : data,
                code    : 200,
                message : "success"
              }
              resp.send(result);
            }else{
              resp.send("<img src='data:text/html;base64,"+data+"'/>");
            }
          }else{
            var err = {
              code    : 400,
              data    : [],
              message : "验证码获取失败"
            }
            res.send(err);
          }
        });
      },
      error:function(){
      }
    });
});

router.get('/getvfcodeSrc', function(req, resp, next) {
  getCodeKey('',{
    success:function(code,jszx_cookie){
      req.session.jszx_cookie = jszx_cookie;
      req.session.code = code;
      var time = new Date().getTime();
      var url = "http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k="+code+"&t="+time;
      superagent.get(url)
        .set("Cookie",jszx_cookie)
        .set("Referer", "http://210.41.224.117/Login/xLogin/Login.asp")
        .end((err, res) => {
          // console.log(res.text);
          if(res.statusCode == 200){
            var data = new Buffer(res.text, 'binary').toString('base64');
            data = "data:text/html;base64,"+data;
            resp.send(new Buffer(res.text, 'binary'));
          }else{
            res.send(err);
          }
        });
      },
      error:function(){
        
      }
    });
});

// router.get('/getvfcode', function(req, resp, next) {
//   getCodeKey('',{
//     success:function(code,jszx_cookie){
//       req.session.jszx_cookie = jszx_cookie;
//       req.session.code = code;
//       var time = new Date().getTime();
//       var url = "http://210.41.224.117/Login/xLogin/yzmDvCode.asp?k="+code+"&t="+time;
//       superagent.get(url)
//         .set("Cookie",jszx_cookie)
//         .set("Referer", "http://210.41.224.117/Login/xLogin/Login.asp")
//         .end((err, res) => {
//           // console.log(res.text);
//           if(res.statusCode == 200){
//             var data = new Buffer(res.text, 'binary').toString('base64');
//             // resp.send("<img src=data:text/html;base64,"+res.text+"/>");
//             data = "data:text/html;base64,"+data;
//             var result = {
//               data   : data,
//               code   : 200,
//               cookie : cookie
//             }
//             resp.send("data");
//             // resp.send("<img src='data:text/html;base64,"+data+"'/>");
//           }else{
//             res.send(err);
//           }
//         });
//       },
//       error:function(){

//       }
//     });
// });

router.get('/ocr', function(req, resp, next) {
  var url = "http://word.bj.baidubce.com/v1/ocr/general";
  superagent.post(url)
  .set("host","word.bj.baidubce.com")
  .set("authorization", "bce-auth-v1/46bd9968a6194b4bbdf0341f2286ccce/2015-03-24T13:02:00Z/1800/host;x-bce-date/994014d96b0eb26578e039fa053a4f9003425da4bfedf33f4790882fb4c54903")
  .end((err, res) => {
    // console.log(res.text);
  });
});

router.get('/zhms', function(req, resp, next) {
  var url = "http://www.zhms.cn/News/yinyang/";
  superagent.get(url)
  .charset('gbk')
  .end((err, res) => {
    console.log(res.text);
    resp.send(res.text);
  });
});


//登陆教务处
router.get('/login', function(req, resp, next) {
  var login_cookie = req.session.login_cookie;
  if(!login_cookie){
    var txtId      = req.query.name,
        txtMM      = req.query.passwd,
        verifycode = req.query.verifycode;
    var jszx_cookie = req.session.jszx_cookie ? req.session.jszx_cookie : '';
    console.log(jszx_cookie);

    if(!jszx_cookie){
      result = {
        code    : 400,
        data    : [],
        message : '没有先获取验证码'
      }
      resp.send(result);
      return;
    }

    var code = req.session.code ? req.session.code : 1;
    //获取codekey
    var postData = "WinW=1920&WinH=1040&txtId="+txtId+"&txtMM="+txtMM+"&verifycode="+verifycode+"&codeKey="+code+"&Login=Check";
    var url = "http://210.41.224.117/Login/xLogin/Login.asp";
    superagent.post(url)
      .send(postData)
      .set('Referer', 'http://210.41.224.117/Login/xLogin/Login.asp')
      .set("Cookie",jszx_cookie)
      .charset("gbk")
      .end((err, res) => {
        if(res.statusCode == 200){
          var $ = cheerio.load(res.text);
          var message = $(".user_main_z span").text();
          if(message){
            console.log(message);
            var result = {
              code    : 601,
              data    : [],
              message : message
            }
            resp.send(result);
            return;
          }
          
          var data = res.text;
          var url = "http://jxgl.cuit.edu.cn/Jxgl/Xs/MainMenu.asp";
          superagent
            .get(url)
            // .set("Cookie",jszx_cookie)
            .end(function(err,result){

              if(err){
                var err = {
                  code    : 600,
                  data    : [],
                  message : "跳转失败"
                }
                res.send(err);
                return;
              }

              var jwc_cookie = result.headers['set-cookie'];
              if(!jwc_cookie){
                jwc_cookie = ''
              }else{
                if(jwc_cookie[0].split(";").length){
                  jwc_cookie = jwc_cookie[0].split(";")[0];
                }else{
                  jwc_cookie = '';
                }
              }
              console.log(jwc_cookie);
              var url = "http://jxgl.cuit.edu.cn/Jxgl/UserPub/Login.asp?UTp=Xs";
              superagent
                .get(url)
                .set("Cookie",jwc_cookie)
                .end(function(err,result){
                  if(err){
                    var err = {
                      code    : 600,
                      data    : [],
                      message : "跳转失败"
                    }
                    res.send(err);
                    return;
                  }

                  var url = "http://jxgl.cuit.edu.cn/Jxgl/Login/tyLogin.asp";
                  superagent
                    .get(url)
                    .set("Cookie",jwc_cookie)
                    .end(function(err,result){
                      if(err){
                        var err = {
                          code    : 600,
                          data    : [],
                          message : "跳转失败"
                        }
                        res.send(err);
                        return;
                      }

                      // console.log(result.text);
                      var retext = result.text;
                      var sid1url = retext.split("URL=")[1].split("\">")[0];
                      console.log(sid1url);
                      superagent
                      .get(sid1url)
                      .charset('gbk')
                      .set("Cookie",jszx_cookie)
                      .end(function(err,result){
                        if(err){
                          var err = {
                            code    : 600,
                            data    : [],
                            message : "跳转失败"
                          }
                          res.send(err);
                          return;
                        }
                        // console.log(result);
                        superagent
                        .get("http://210.41.224.117/Login/qqLogin.asp")
                        .charset('gbk')
                        .set("Cookie",jszx_cookie)
                        .end(function(err,result){
                          if(err){
                            var err = {
                              code    : 600,
                              data    : [],
                              message : "跳转失败"
                            }
                            res.send(err);
                            return;
                          }
                          // console.log(result);
                          superagent
                          .get("http://jxgl.cuit.edu.cn/Jxgl/Login/tyLogin.asp")
                          .charset('gbk')
                          .set("Cookie",jwc_cookie)
                          .set("handle_redirects","true")
                          .end(function(err,result){
                            if(err){
                              var err = {
                                code    : 600,
                                data    : [],
                                message : "跳转失败"
                              }
                              res.send(err);
                              return;
                            }
                            // console.log(result);
                            // return;
                            req.session.login_cookie = jwc_cookie;
                            superagent
                            .get("http://jxgl.cuit.edu.cn/Jxgl/UserPub/GetCjByXh.asp?UTp=Xs")
                            .set("Referer","http://jxgl.cuit.edu.cn/Jxgl/Xs/MainMenu.asp")
                            .charset('gbk')
                            .set("Cookie",jwc_cookie)
                            .end(function(err,result){
                              if(err){
                                var err = {
                                  code    : 600,
                                  data    : [],
                                  message : "获取成绩失败"
                                }
                                res.send(err);
                                return;
                              }
                              // console.log(result.text);
                              // resp.send(result.text);
                              formatGrade(result.text,resp)
                            })
                          })
                        }) 
                      }) 
                    })    
                })
            })
        }
      })
    }else{
      superagent
      .get("http://jxgl.cuit.edu.cn/Jxgl/UserPub/GetCjByXh.asp?UTp=Xs")
      .set("Referer","http://jxgl.cuit.edu.cn/Jxgl/Xs/MainMenu.asp")
      .charset('gbk')
      .set("Cookie",login_cookie)
      .end(function(err,result){
        // console.log(result);
        // resp.send(result.text);
        formatGrade(result.text,resp)
      })
    }
});

function formatGrade(content,resp){
  var $ = cheerio.load(content);
  // console.log($(".tabThinM:last-children")[6]);
  //各学期各门课程的最后成绩
  // var $grade_table = $(".tabThinM")[6];
  var gradeArray = new Array();
  var arrayLength = 0;

  if(!$(".tabThinM").length){
    var err = {
      code    : 601,
      data    : [],
      message : "获取成绩失败"
    }
    res.send(err);
    return;
  }

  $(".tabThinM").each(function(i,ele){
    if(i == 6){
      // console.log($(this).find("tr"));
      //定义一个json数组保存成绩信息
      //编辑所有的tr

      //定义一个json保存成绩信息
      var grade = {};
      var course_content = new Array();

      $(this).find("tr").each(function(i,ele){
        //判断是否是时间标题

        if($(this).find("td").length == 1){

          if(grade.course && grade.year){
            gradeArray[arrayLength] = grade;
            arrayLength++;
            grade = {};
            course_content = new Array();
            // gradeArray.push(grade);
          }else{
            grade = {};
            course_content = new Array();
          }

          var title_content = $(this).find("td").text();
          var year_content = title_content.split(" ");
          //解析学年
          var year = year_content[0].replace("第","").replace("学年","").replace("--","-");
          //解析学期
          var team = year_content[1].split("(")[0].match(/\d+/g)[0];
          //解析GPA
          var gpa = year_content[1].split(", ")[4].split(")")[0];
          // console.log(year+"/"+team+"/"+gpa);
          grade.year = year;
          grade.team = team;
          grade.gpa = gpa;

          console.log(year_content);
        }else{
          console.log("000000");
          //课程名称
          // var course_name = $(this).find("a").text();

          var course = new Array();
          //课程学时
          var course_hours = $(this).find("font");
          $(this).find("TD").each(function(k,ele){
            // $(this).children("FONT").each(function(i,ele){
            //   course.push($(this).text());
            // })
            // console.log($(this).text());
            // course.push($(this).text())
            var key = 0;
            for(var i= 0; i < $(this).text().split(/[\r]/g).length;i++){
              for(var j = 0; j < $(this).text().split(/[\r]/g)[i].split(/[\n]/g).length;j++){
                if($(this).text().split(/[\r]/g)[i].split(/[\n]/g)[j] && !key){
                  key = 1;
                  var course_text = $(this).text().split(/[\r]/g)[i].split(/[\n]/g)[j];
                  if(k == 6){
                    course_text = course_text.substr(0,3);
                    if(course_text!=100){
                      course_text = course_text.substr(0,2);
                    }
                    course.push(course_text);
                  }else{
                    course.push(course_text);
                  }
                  break;
                }
              }
            }
          })
          // console.log(course);
          if(course.length > 7){
            var course_once = {
              "course_name"      : course[1],
              "period"           : course[2],
              "credit"           : course[3],
              "usual_grade"      : course[4],
              "final_exam_grade" : course[5],
              "grade"            : course[6] 
            }
            course_content.push(course_once);
            var course_once = {
              "course_name"      : course[8],
              "period"           : course[9],
              "credit"           : course[10],
              "usual_grade"      : course[11],
              "final_exam_grade" : course[12],
              "grade"            : course[13] 
            }
            course_content.push(course_once);
          }else{
            var course_once = {
              "course_name"      : course[1],
              "period"           : course[2],
              "credit"           : course[3],
              "usual_grade"      : course[4],
              "final_exam_grade" : course[5],
              "grade"            : course[6] 
            }
            course_content.push(course_once);
          }
          grade.course = course_content;
        }
      })
      if(grade.course){
        gradeArray[arrayLength] = grade;
        arrayLength++;
        // gradeArray.push(grade);
      }
      // console.log(gradeArray);
      resp.send(gradeArray);
    }
  })

}

//获取成绩
router.get('/getjwc', function(req, resp, next){
  var cookie = req.session.jwc_cookie;
  console.log(cookie);
  if(!cookie){
    res.send("cookie过期");
    return;
  }else{
    var url = 'http://jxgl.cuit.edu.cn/Jxgl/Xs/MainMenu.asp';
    superagent.get(url)
    .charset('gbk')
    .set("Cookie",cookie)
    .end((err, res) => {
      console.log(res.text);
      resp.send(res.text);
    });
  }
});




// router.get('/getvfcode', function(req, res, next) {
//   getCodeKey({
//     success:function(code){
//       getJWCVfCode(code,{
//         success:function(data){
//           // res.send("<img src="+data+"/>");
//           sendSuccessMessage(res,data);
//         },
//         error:function(error){
//           sendErrorMessage(res,error);
//         }
//       })
//     },
//     error:function(error){
//       sendErrorMessage(res.error);
//     }
//   });
//   // getJWCVfCode({
//   //   success:function(data){
//   //     // res.send("<img src="+data+"/>");
//   //     sendSuccessMessage(res,data);
//   //   },
//   //   error:function(error){
//   //     sendErrorMessage(res,error);
//   //   }
//   // })
// });

router.get('/getcodekey', function(req, res, next) {
  getCodeKey('',{
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


function getCodeKey(cookie,callback){
  var url = 'http://210.41.224.117/Login/xLogin/Login.asp';
  superagentUrlData(cookie,url,'',{
    success:function(body,jwc_cookie){
      // console.log(body);
      // var $ = cheerio.load(res.text);
      var $ = cheerio.load(body);
      var codeKey = $("input[name=codeKey]").val();
      // console.log(codeKey);
      if(codeKey){
        callback.success(codeKey,jwc_cookie);
      }else{
        callback.error($("body").text(),jwc_cookie);
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
        // console.log(res.text);
        var data = new Buffer(res.text, 'binary').toString('base64');
        // console.log(data);
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
          // console.log(cookie);  
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
    .end((err, res) => {
      console.log(res.text);
      var cookie = res.headers['set-cookie'];
      if(!cookie){
        cookie = ''
      }else{
        // console.log(cookie);
        if(cookie[0].split(";").length){
          // console.log(cookie[0].split(";")[0]);
          cookie = cookie[0].split(";")[0];
        }else{
          // console.log(cookie[0]);
          cookie = '';
        }
      }

      if(res.statusCode == 200){
        callback.success(res.text,cookie);
      }else{
        callback.error(res.text,cookie);
      }
    });
  }else{
    superagent.get(url)
    .charset('gbk')
    .end((err, res) => {
      var cookie = res.headers['set-cookie'];
      // console.log(cookie);
      if(cookie[0].split(";").length){
        // console.log(cookie[0].split(";")[0]);
        cookie = cookie[0].split(";")[0];
      }else{
        // console.log(cookie[0]);
        cookie = '';
      }

      if(res.statusCode == 200){
        callback.success(res.text,cookie);
      }else{
        callback.error(res.text,cookie);
      }
    });
  }
}

//获取课程
function superagentPostWithCookie(cookie,url,charset,send,callback){
  superagent.post(url)
    .send(send)
    .set('Referer', 'http://210.41.224.117/Login/xLogin/Login.asp')
    .set("Cookie",cookie)
    .end((err, res) => {
      if(res.statusCode == 200){
        // console.log(res.headers['set-cookie']);
        // var cookie = res.headers['set-cookie'];
        // console.log(cookie);
        // if(cookie[0].split(";").length){
        //   console.log(cookie[0].split(";")[0]);
        //   cookie = cookie[0].split(";")[0];
        // }else{
        //   console.log(cookie[0]);
        //   cookie = '';
        // }

        callback.success(res.text);
        //解析出方式一的链接
      }else{
        callback.error(res.text);
      }
    });
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
