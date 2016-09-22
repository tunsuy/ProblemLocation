
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");

var express = require('express');
var router = express.Router();
var reqServerIP = "";

var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

var dbsecServerInfo = xmlDataHandler.getServerInfo("dbsecAccountInfo");
var dbServerInfo = xmlDataHandler.getServerInfo("dbAccountInfo");

router.get('/', function(req, res, next) {

	// var reqServerIP = req.query.id;
	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
    console.log("登录的服务器为："+global.reqServerIP);
    if (global.reqServerIP) {
		res.render('task.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
	}else{
        res.redirect('/');
    }
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {
	var reqServerIP = req.query.id;

	var reqAccount = req.body['account'];
    global.accountCache = reqAccount;
	var sendTask = req.body['sendTask'];
	var receiveTask = req.body['receiveTask'];

	var pid = "", sendTaskNum = "", receiveTaskNum = "";
	var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info "+reqAccount;
    var pidStr = "";

	var Client = require('ssh2').Client;
	var alyConn = new Client();
    if (global.alyFlag == "aly") {
        alyConn.on('ready', function() {
            alyConn.exec(contentCmd, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(err, stream) {
                    
                    alyConn.end();
                    console.log("退出121.42.193.51成功！！！！！！！");

                    alyConn.on('ready', function() {                               
                        alyConn.exec(contentCmd, function(err, stream) {
                            if (err) throw err;
                            stream.on('close', function(err, stream) {
                                alyConn.end();
                            }).on('data', function(data) {
                                contentData += "\n"
                                contentData += data;
                                console.log("返回内容: "+contentData);
                                res.render('task.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                                return;
                            }).stderr.on('data', function(data) {
                                console.log('STDERR: ' + data);
                            });

                        });

                    }).connect({
                        host: dbServerInfo.ip,
                        port: 22,
                        username: dbServerInfo.userName,
                        password: dbServerInfo.passWord
                    });

                }).on('data', function(data) {

                    pidStr = (/pid=(\d+)/).exec(data);
                    if (pidStr == "" || pidStr == null) {
                        contentData += data;
                        res.render('task.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "任务") {
                            sendTaskNum = modelsPropertysData[index][1].firstChild.data;
                            receiveTaskNum = modelsPropertysData[index][2].firstChild.data;
                            break;
                        };
                    }
                    sendTaskNum = (sendTask == "on")?sendTaskNum:0;
                    receiveTaskNum = (receiveTask == "on")?receiveTaskNum:0;

                    contentData += data
                    pid = pidStr[1];
                    console.log("pid: "+pid);

                    contentCmd = "python task.py "+pid+" "+sendTaskNum+" "+receiveTaskNum;
                    
                }).stderr.on('data', function(data) {
                    console.log('STDERR: ' + data);
                });

            });
        }).connect({
            host: dbsecServerInfo.ip,
            port: 22,
            username: dbsecServerInfo.userName,
            password: dbsecServerInfo.passWord
        });
    }else{
        // conn.on('ready', function() {
        if (global.conn) {
            global.conn.exec(contentCmd, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(err, stream) {
                    if (pidStr == "" || pidStr == null) {
                        // global.conn.end();
                    }
                    // conn.end();
                }).on('data', function(data) {

                    pidStr = (/pid=(\d+)/).exec(data);
                    if (pidStr == "" || pidStr == null) {
                        console.log("没有该用户。。。");
                        contentData += data;
                        res.render('task.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "任务") {
                            sendTaskNum = modelsPropertysData[index][1].firstChild.data;
                            receiveTaskNum = modelsPropertysData[index][2].firstChild.data;
                            break;
                        };
                    }
                    sendTaskNum = (sendTask == "on")?sendTaskNum:0;
                    receiveTaskNum = (receiveTask == "on")?receiveTaskNum:0;

                    contentData += data
                    pid = pidStr[1];
                    console.log("pid: "+pid);

                    contentCmd = "python task.py "+pid+" "+sendTaskNum+" "+receiveTaskNum;

                    global.conn.exec(contentCmd, function(err, stream) {
                        if (err) throw err;
                        stream.on('close', function(err, stream) {
                            // global.conn.end();
                        }).on('data', function(data) {
                            contentData += "\n"
                            contentData += data;
                            console.log("返回内容: "+contentData);
                            res.render('task.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
    
});



module.exports = router;
