
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");

var express = require('express');
var router = express.Router();
var reqServerIP = "";

var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

router.get('/', function(req, res, next) {

	// var reqServerIP = req.query.id;
	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
	console.log("登录的服务器为："+global.reqServerIP);
	if (global.reqServerIP) {
		res.render('privilege.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
	}else{
		res.redirect('/');
	}
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {
	reqAccount = req.body['account'];
	global.accountCache = reqAccount;
	reqLookPermitFlag = req.body['lookPermitFlag']
	reqNotifyPermitFlag = req.body['notifyPermitFlag']
	reqPermitAllocationFlag = req.body['permitAllocationFlag']
	// var reqServerIP = req.query.id;
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var cmdData = connectServer.connServer(reqServerIP,"get_user_info.py "+reqAccount+"\nexit\n");
	var pid = "", pushMsgCount="", pushUserEventCount="";
	var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info.py "+reqAccount;
	var didStr = "", pidStr = "";

	var Client = require('ssh2').Client;
	var alyConn = new Client();

	if (global.alyFlag == "aly") {
		alyConn.on('ready', function() {
	        alyConn.exec(contentCmd, function(err, stream) {
	            if (err) throw err;
	            stream.on('close', function(err, stream) {
	                if (didStr == "" || didStr == null) {
	            		alyConn.end();
	            	}else{

	            		alyConn.end();
		                console.log("退出115.28.39.52成功！！！！！！！");

		               alyConn.on('ready', function() {			            	
			            	
			            	alyConn.exec(contentCmd, function(err, stream) {
					            if (err) throw err;
					            stream.on('close', function(err, stream) {
					                alyConn.end();
					            }).on('data', function(data) {
					            	contentData += "\n\n"
					            	contentData += data;
					            	console.log("返回内容: "+contentData);
					            	res.render('privilege.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
					            	return;
					            }).stderr.on('data', function(data) {
					                console.log('STDERR: ' + data);
					            });

					        });
					            	
					    }).connect({
					        host: "121.42.193.51",
					        port: 22,
					        username: "background",
					        password: "c7C02Ff079cCfB3aEe4c"
					    });
					}

	            }).on('data', function(data) {

	            	didStr = (/did=(\d+)/).exec(data);
	                pidStr = (/pid=(\d+)/).exec(data);
	                if (didStr == "" || didStr == null) {
	                    contentData += data;
	                    res.render('privilege.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
	                    return;
	                }

	                lookPermitFlag = (reqLookPermitFlag == "on")?1:0;
	                notifyPermitFlag = (reqNotifyPermitFlag == "on")?1:0;
	                permitAllocationFlag = (reqPermitAllocationFlag == "on")?1:0;

	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("did: "+did);
	            	console.log("pid: "+pid);

	            	contentCmd = "python privilege.py "+did+" "+pid+" "+lookPermitFlag+" "+notifyPermitFlag+" "+permitAllocationFlag;
	                
	            }).stderr.on('data', function(data) {
	                console.log('STDERR: ' + data);
	            });

	        });
	    }).connect({
	        host: "115.28.39.52",
	        port: 22,
	        username: "frontground",
	        password: "873b9673fdb5f532"
	    });
	}else{
		// conn.on('ready', function() {
		if (global.conn) {
	        global.conn.exec(contentCmd, function(err, stream) {
	            if (err) throw err;
	            stream.on('close', function(err, stream) {
	            	if (didStr == "" || didStr == null) {
	            		// global.conn.end();
	            	}
	                // conn.end();
	            }).on('data', function(data) {

	            	didStr = (/did=(\d+)/).exec(data);
	                pidStr = (/pid=(\d+)/).exec(data);
	                if (didStr == "" || didStr == null) {
	                    contentData += data;
	                    res.render('privilege.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
	                    return;
	                }

	                lookPermitFlag = (reqLookPermitFlag == "on")?1:0;
	                notifyPermitFlag = (reqNotifyPermitFlag == "on")?1:0;
	                permitAllocationFlag = (reqPermitAllocationFlag == "on")?1:0;

	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("did: "+did);
	            	console.log("pid: "+pid);

	            	contentCmd = "python privilege.py "+did+" "+pid+" "+lookPermitFlag+" "+notifyPermitFlag+" "+permitAllocationFlag;

	            	global.conn.exec(contentCmd, function(err, stream) {
			            if (err) throw err;
			            stream.on('close', function(err, stream) {
			                // conn.end();
			            }).on('data', function(data) {
			            	
			            	contentData += "\n\n"
			            	contentData += data;
			            	console.log("返回内容: "+contentData);
			            	res.render('privilege.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
			            	
			            }).stderr.on('data', function(data) {
			                console.log('STDERR: ' + data);
			            });

			        });
	                
	            }).stderr.on('data', function(data) {
	                console.log('STDERR: ' + data);
	            });

	        });
		}else{
			res.redirect('/');
		}
	    // }).connect({
	    //     host: global.reqServerIP,
	    //     port: 22,
	    //     username: global.reqUserName,
	    //     password: global.reqPwd
	    // });
	}
	

	// console.log("cmdData: "+cmdData);
	// var modelsPropertysData = xmlDataHandler.getmodelsPropertysData();
	// var questionsData = xmlDataHandler.getQuestionsData();
	// var reqId = req.query.id;
	// console.log(reqId);
	// if(reqId != undefined){
	// 	var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
	// }
	// var contentData = getFileData("")
	// res.render('push.ejs', { modelsPropertys: modelsPropertysData, serverIP: reqServerIP, account: reqAccount, content: cmdData});
});

// function getFileData(fileName){
// 	var rf=require("fs");
// 	var contentData=rf.readFileSync(fileName,"utf-8");
// 	return contentData;
// }

module.exports = router;
