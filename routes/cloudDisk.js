
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");
var sshPromise = require("../models/commons/sshPromise.js");
var info = require("../models/commons/info.js");

var express = require('express');
var router = express.Router();
var reqServerIP = "";

var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

var dbsecServerInfo = xmlDataHandler.getServerInfo("dbsecAccountInfo");
var dbServerInfo = xmlDataHandler.getServerInfo("dbAccountInfo");

var contentData = "用户的基本信息：\n";
//Private function
var gainUserInfoNextCMD = function(data) {
	console.log("userInfo data: "+data);
	contentData += ("\n"+data);
	var userInfo = commonInfo.userInfo(data);
	if (userInfo.did == "") {
		res.render('customer.ejs', 
    		{ modelsAttributes: modelsAttributesData, 
    			modelsPropertys: modelsPropertysData, 
    			serverIP: global.reqServerIP, 
    			account: reqAccount, 
    			content: contentData
    		});
		return;
	}
	contentCmd = "python cloudDisk.py "+userInfo.did+" "+reqFileName;

	return contentCmd;
}

var putoutToView = function(data) {
	contentData += ("\n"+data);
	console.log("返回内容: "+contentData);
	res.render('customer.ejs', 
		{ modelsAttributes: modelsAttributesData, 
			modelsPropertys: modelsPropertysData, 
			serverIP: global.reqServerIP, 
			account: reqAccount, 
			content: contentData
		});
	return;
}

router.get('/', function(req, res, next) {
	console.log("登录的服务器为："+global.reqServerIP);
	if (global.reqServerIP) {
		res.render('cloudDisk.ejs', { 
			modelsAttributes: modelsAttributesData, 
			modelsPropertys: modelsPropertysData, 
			serverIP: global.reqServerIP, 
			account: "", 
			content: ""
		});
	}else{
		res.redirect('/');
	}
});

var Promise = require('bluebird');

//promisify、promisifyAll
//将需要异步的方法promise化
var commonInfo = info.CommonInfo.createNew();
commonInfo = Promise.promisifyAll(commonInfo); //遍历该对象所有的方法，方法名后加Async

var sshCallback = sshPromise.Callback.createNew();
// sshCallback = Promise.promisifyAll(sshCallback);

// global.conn.execAsync = Promise.promisify(global.conn.exec);

router.post('/', function(req, res, next) {
	reqAccount = req.body['account'];
	global.accountCache = reqAccount;
	reqFileName = req.body['fileName'];
	var contentCmd = "get_user_info "+reqAccount;

	var ssh2 = Promise.promisifyAll(require('ssh2'));
	var Client = ssh2.Client;
	var alyConn = new Client();
	// alyConn.execAsync = Promise.promisify(alyConn.exec);

	if (global.alyFlag == "aly") {
		alyConn.on('ready', function() {
			alyConn.execAsync(contentCmd)
				.spread(sshCallback.execAsync)
				.then(gainUserInfoNextCMD)
				.then(function(nextCMD) {
					alyConn.end();
					alyConn.on('ready', function() {
						alyConn.execAsync(nextCMD)
							.then(sshCallback.execAsync)
							.then(putoutToView)
							.catch(function(e){
								console.log("conn execAsync is err: "+e);
							})
							.finally(function() {
								//todo
							});
					}).connect({
				        host: dbsecServerInfo.ip,
				        port: 22,
				        username: dbsecServerInfo.userName,
				        password: dbsecServerInfo.passWord
				    });

				})
				.catch(function(e){
					console.log("conn execAsync is err: "+e);
				})
				.finally(function() {
					//todo
				});
		}).connect({
	        host: dbsecServerInfo.ip,
	        port: 22,
	        username: dbsecServerInfo.userName,
	        password: dbsecServerInfo.passWord
	    });

	}
	if (!global.conn) {
		res.redirect('/');
	}
	global.conn.execAsync(contentCmd)
		.then(sshCallback.execAsync)
		.then(gainUserInfoNextCMD)
		.then(function(nextCMD){
			console.log("nextCMD: "+nextCMD);
			return global.conn.execAsync(nextCMD);
		})
		.then(sshCallback.execAsync)
		.then(putoutToView)
		.then(sshCallback.stderrAsync)
		.catch(function(e){
			console.log("conn execAsync is err: "+e);

		})
		.finally(function() {
			//todo
		});
	
});

module.exports = router;
