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
var Movies = AV.Object.extend('Movies');
var User = AV.Object.extend('User');
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
        var length;
        $(".item").each(function(i,ele){
          // var time = $(".tt span").text();
          var time = $(this).find(".tt").find("span").text();
          var url  = "http://www.bttiantang.com/" + $(this).find(".tt").find("a").attr("href");
          var name = $(this).find(".tt").find("a").text();
          var anothername = $(this).find(".tt").next().find("a").text();
          var detail = $(this).find(".des").text();
          var score = leaveBlank($(this).find(".rt").text());
          var img = $(this).find(".litpic a img").attr("src");
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
          length = i + 1;
          })        
        var datas = {code,message,data,length};
        console.log(datas);
        resp.send(datas);
    })
}

//去除前后空格
function leaveBlank(str){
  str = str.replace(/\s+/g,"");
  return str;
}

router.post('/saveMovie', function(req, res, next) { //收藏电影
  var movies = new Movies();
  var name = req.body.name;
  console.log(name);
  var user = AV.User.current();
  var username = user.get('user');
  // var name = req.param('name');
  movies.set('name', name);
  movies.set('email',username);
  movies.save(null, {
    success: function(todo) {
      // res.redirect('/todos');
      console.log("success");
      movieId = movies.id;
      var result = {
                    code: 200,
                    id: movieId,
                    message: 'Operation succeeded'
                }
       res.send(result);
    },
    error: function(err) {
      next(err);
    }
  })
})

router.post('/delMovie',function(req, res, next){//取消收藏
	var id = req.body.id;
	// var name = req.param('name');
	console.log(id);
	var movies = AV.Object.createWithoutData('Movies', id);
  	movies.destroy().then(function (success) {
  	console.log(success);
  	console.log("删除成功");
    // 删除成功
  }, function (error) {
  	console.log(error);
  	console.log("删除失败");
    // 删除失败
  });
	// AV.Query.doCloudQuery('delete from Movies where id="578f419d79bc44005f058661"').then(function (data) {
	// 	console.log("删除成功");
 //  }, function (error) {
 //  	console.log("删除失败");
 //  });
})

router.post('/signUp',function(req, res, next){//注册
	var email = req.body.email;
	var name = req.body.name;
	var password = req.body.password;
	// console.log(email);
	var _User = new User();
	// 设置用户名
  	_User.setUsername(name);
  	// 设置密码
  	_User.setPassword(password);
  	// 设置邮箱
  	_User.setEmail(email);
  	_User.signUp().then(function (loginedUser) {
      console.log(loginedUser);
      console.log('success');
      var result = {
                    code: 200,
                    message: 'Operation succeeded'
                }
      res.send(result);
  	}, (function (error) {
  		console.log('error');
  	}));
})

router.post('/signin',function(req, res, next){//登陆
	var name = req.body.name;
	var password = req.body.password; 
	AV.User.logIn(name, password).then(function (_User) {
    	// console.log(loginedUser);
    	console.log("success");
    	var result = {
                    code: 200,
                    username:name,
                    message: 'Operation succeeded'
                }
      res.send(result);
  	}, function (error) {
  		console.log(error);
  	});
 })

router.post('/reset',function(req, res, next){//邮箱重置密码
	var email = req.body.email;
	AV.User.requestPasswordReset(email).then(function (success) {
  		}, function (error) {
  	});
 })

module.exports = router;