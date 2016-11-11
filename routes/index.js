var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('index.js');

var connectServer = require("../public/javascripts/connectServer.js");
var uploadToolFile = require("../public/javascripts/uploadToolFile.js");

var express = require('express');
var router = express.Router();

var domain = require('domain');

// session({errInfo: "用户名或者密码错误"});

/* GET home page. */
router.get('/', function(req, res, next) {
	req.session.alyFlag = req.query.id;
	if (req.session.alyFlag == "aly") {
		req.session.reqServerIP = "阿里云";
	}
	loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
	if(req.session.reqServerIP){
		uploadToolFile.toAly(req, res);
	}
	else{
		res.redirect('/');
	}
});

router.post('/', function(req, res, next) {
	req.session.reqServerIP = req.body['serverIP'];
	req.session.reqUserName = req.body['userName'];
	req.session.reqPwd = req.body['pwd'];

	var ssh2 = require('ssh2');
    var Client = ssh2.Client;
    req.session.conn = new Client();

    uploadToolFile.toNomal(req, res);


	// var session = req.session;
	// console.log("session-err:    "+session.errInfo);
	// // session.obj = {errInfo: "用户名或者密码错误"};
	
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var questionsData = xmlDataHandler.getQuestionsData();
	// var reqId = req.query.id;
	// console.log(reqId);
	// if(reqId != undefined){
	// 	var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
	// }

	// 使用 domain 来捕获大部分异常
	// var reqDomain = domain.create();
 //    reqDomain.on('error', function () {
 //        try {
 //            var killTimer = setTimeout(function () {
 //                process.exit(1);
 //            }, 30000);
 //            killTimer.unref();

 //            console.log("登录失败！！！！！！！！");
	//   		res.redirect('/', {errInfo: "用户名或者密码错误"});

	//   		conn.end();
 //        } catch (e) {
 //            console.log('error when exit', e.stack);
 //        }
 //    });

 //    reqDomain.add(req);
 //    reqDomain.add(res);
 //    reqDomain.run(next);

	
	// process.on('uncaughtException', function (err) {
	// 	//打印出错误
	// 	console.log(err);
	// 	//打印出错误的调用栈方便调试
	// 	console.log(err.stack);
	// 	console.log("登录失败！！！！！！！！");
	//   	res.render('login.ejs', {errInfo: "用户名或者密码错误"});
	//   	return;
	// });

	
	// uncaughtException 避免程序崩溃
	process.on('uncaughtException', function (err) {
	    loggerHelper.writeErr(err);

	    try {
	        // var killTimer = setTimeout(function () {
	        //     process.exit(1);
	        // }, 30000);
	        // killTimer.unref();
	        // console.log("路径："+req.path);

	        loggerHelper.writeErr("登录失败exce！！！！！！！！");
	        res.render('login.ejs', {errInfo: "用户名或者密码错误"});
		  	// res.redirect('/');
	        req.session.conn.end();
	    } catch (e) {
	        loggerHelper.writeErr('error when exit', e.stack);
	    }
	});


});


module.exports = router;
