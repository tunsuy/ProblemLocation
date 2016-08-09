
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");
var uploadToolFile = require("../public/javascripts/uploadToolFile.js");

var express = require('express');
// var session = require('express-session');
var router = express.Router();
var reqServerIP = "";
global.accountCache = ""

var domain = require('domain');

// session({errInfo: "用户名或者密码错误"});


var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

/* GET home page. */
router.get('/', function(req, res, next) {

	// var questionsData = xmlDataHandler.getQuestionsData();
	// var reqId = req.query.id;
	// console.log(reqId);

	global.alyFlag = req.query.id;
	if (global.alyFlag == "aly") {
		global.reqServerIP = "阿里云";
	}
	console.log("登录的服务器为："+global.reqServerIP);
	if(global.reqServerIP){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
		// console.log("开始执行uploadFile:------");
		// uploadToolFile.uploadFile("115.28.39.52", "frontground", "873b9673fdb5f532", "aly");
		res.render('index.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP});
	}
	else{
		// res.render('index.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: "当前没有登录服务器"});
		res.redirect('/');
	}
});

router.post('/', function(req, res, next) {

	global.reqServerIP = req.body['serverIP'];
	global.reqUserName = req.body['userName'];
	global.reqPwd = req.body['pwd'];
	console.log("serverIP:"+global.reqServerIP);
	// connectServer.connServer(reqServerIP,"");
	console.log('-----------------------');

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

	var Client = require('ssh2').Client;
	global.conn = new Client();
	global.conn.on('ready', function() {
		global.conn.exec("ls", function(err, stream) {
            if (err){ 
            	throw err;
            	return;
        	}
            stream.on('close', function(err, stream) {
                 // conn.end();
            }).on('data', function(data) {
            	console.log("登录正确！！！！！！！！");
            	console.log("开始执行uploadFile:------");
				uploadToolFile.uploadFile(global.reqServerIP, global.reqUserName, global.reqPwd, "");
                res.render('index.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP});
                
            }).stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });
        });
        
    }).connect({
        host: global.reqServerIP,
        port: 22,
        username: global.reqUserName,
        password: global.reqPwd
    });
	
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
	    console.log(err);

	    try {
	        // var killTimer = setTimeout(function () {
	        //     process.exit(1);
	        // }, 30000);
	        // killTimer.unref();
	        // console.log("路径："+req.path);

	        console.log("登录失败exce！！！！！！！！");
	        res.render('login.ejs', {errInfo: "用户名或者密码错误"});
		  	// res.redirect('/');
	        global.conn.end();
	    } catch (e) {
	        console.log('error when exit', e.stack);
	    }
	});


});


module.exports = router;
