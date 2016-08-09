
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
		res.render('push.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
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
	reqPushServer = req.body['pushServer'];
	reqUserSetting = req.body['userSetting'];
	reqPushMsg = req.body['pushMsg'];
	reqLoginInfo = req.body['loginInfo'];
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
	            	}

	            }).on('data', function(data) {

	            	didStr = (/did=(\d+)/).exec(data);
	                pidStr = (/pid=(\d+)/).exec(data);
	                if (didStr == "" || didStr == null) {
	                    contentData += data;
	                    res.render('push.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
	                    return;
	                }

	            	for (var index=0; index<modelsPropertysData.length; index++){
	            		if (modelsPropertysData[index][0].firstChild.data == "推送") {
	            			pushMsgCount = modelsPropertysData[index][1].firstChild.data;
	            			pushUserEventCount = modelsPropertysData[index][2].firstChild.data;
	            			break;
	            		};
	            	}

	            	pushServerFlag = (reqPushServer == "on")?1:0;
	            	userSettingFlag = (reqUserSetting == "on")?1:0;
	            	pushMsgCount = (reqPushMsg == "on")?pushMsgCount:0;
	            	pushUserEventCount = (reqLoginInfo == "on")?pushUserEventCount:0;

	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("did: "+did);
	            	console.log("pid: "+pid);

	            	contentCmd = "mdbg_sh.sh "+did+" authwrk -o exportuser did="+did+",pid="+pid;

	            	alyConn.exec(contentCmd, function(err, stream) {
			            if (err) throw err;
			            stream.on('close', function(err, stream) {
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
						            	res.render('push.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
			            }).on('data', function(data) {
			            	var tmpStr = (/\[status[\S\s]*?\[ticket]/).exec(data);
			            	statStr = /.*/.exec(tmpStr);
			            	contentData += "\n该用户在线情况：\n";
			            	contentData += statStr;
			            	contentCmd = "python push.py "+pid+" "+pushServerFlag+" "+userSettingFlag+" "+pushMsgCount+" "+pushUserEventCount;
			            	
			            }).stderr.on('data', function(data) {
			                console.log('STDERR: ' + data);
			            });

			        });
	                
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
	                    res.render('push.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
	                    return;
	                }

	            	for (var index=0; index<modelsPropertysData.length; index++){
	            		if (modelsPropertysData[index][0].firstChild.data == "推送") {
	            			pushMsgCount = modelsPropertysData[index][1].firstChild.data;
	            			pushUserEventCount = modelsPropertysData[index][2].firstChild.data;
	            			break;
	            		};
	            	}

	            	pushServerFlag = (reqPushServer == "on")?1:0;
	            	userSettingFlag = (reqUserSetting == "on")?1:0;
	            	pushMsgCount = (reqPushMsg == "on")?pushMsgCount:0;
	            	pushUserEventCount = (reqLoginInfo == "on")?pushUserEventCount:0;

	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("did: "+did);
	            	console.log("pid: "+pid);

	            	contentCmd = "mdbg_sh.sh "+did+" authwrk -o exportuser did="+did+",pid="+pid;

	            	global.conn.exec(contentCmd, function(err, stream) {
			            if (err) throw err;
			            stream.on('close', function(err, stream) {
			                // conn.end();
			            }).on('data', function(data) {
			            	var tmpStr = (/\[status[\S\s]*?\[ticket]/).exec(data);
			            	statStr = /.*/.exec(tmpStr);
			            	contentData += "\n该用户在线情况：\n";
			            	contentData += statStr;
			            	contentCmd = "python push.py "+pid+" "+pushServerFlag+" "+userSettingFlag+" "+pushMsgCount+" "+pushUserEventCount;
	            	
			            	global.conn.exec(contentCmd, function(err, stream) {
					            if (err) throw err;
					            stream.on('close', function(err, stream) {
					                // global.conn.end();
					            }).on('data', function(data) {
					            	contentData += "\n\n"
					            	contentData += data;
					            	console.log("返回内容: "+contentData);
					            	res.render('push.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
					            }).stderr.on('data', function(data) {
					                console.log('STDERR: ' + data);
					            });

					        });
			            	
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
