
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
        res.render('im.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
    }else{
        res.redirect('/');
    }
		// }
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {
	reqAccount = req.body['account'];
    global.accountCache = reqAccount;
    allSingleMsg = req.body['allSingleMsg'];
    sendSingleMsg = req.body['sendSingleMsg'];
    receiveSingleMsg = req.body['receiveSingleMsg'];
    sendGroupMsg = req.body['sendGroupMsg'];
    // receiveGroupMsg = req.body['receiveGroupMsg'];
	// var reqServerIP = req.query.id;
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var cmdData = connectServer.connServer(reqServerIP,"get_user_info.py "+reqAccount+"\nexit\n");
    var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info "+reqAccount;
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
                    // conn.end();
                }).on('data', function(data) {

                    didStr = (/did=(\d+)/).exec(data);
                    pidStr = (/pid=(\d+)/).exec(data);
                    if (didStr == "" || didStr == null) {
                        contentData += data;
                        res.render('im.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    contentData += data
                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "消息") {
                            allSingleMsgNum = modelsPropertysData[index][1].firstChild.data;
                            sendSingleMsgNum = modelsPropertysData[index][2].firstChild.data;
                            receiveSingleMsgNum = modelsPropertysData[index][3].firstChild.data;
                            sendGroupMsgNum = modelsPropertysData[index][4].firstChild.data;
                            // receiveGroupMsgNum = modelsPropertysData[index][5].firstChild.data;
                            break;
                        };
                    }
                    allSingleMsgNum = (allSingleMsg == "on")?allSingleMsgNum:0;
                    sendSingleMsgNum = (sendSingleMsg == "on")?sendSingleMsgNum:0;
                    receiveSingleMsgNum = (receiveSingleMsg == "on")?receiveSingleMsgNum:0;
                    sendGroupMsgNum = (sendGroupMsg == "on")?sendGroupMsgNum:0;
                    // receiveGroupMsgNum = (receiveGroupMsg = "on")?receiveGroupMsgNum:0;

                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    did = didStr[1];
                    console.log("did: "+did);

                    contentCmd = "mdbg_sh.sh "+did+" imwrk -o exportuser "+"'"+did+" "+pid+"'";
                    alyConn.exec(contentCmd, function(err, stream) {
                        if (err) throw err;
                        stream.on('close', function(err, stream) {
                            
                            alyConn.end();
                            console.log("退出121.42.193.51成功！！！！！！！");

                            setTimeout(function(){
                                alyConn.on('ready', function() {
                                
                                    alyConn.exec(contentCmd, function(err, stream) {
                                        if (err) throw err;
                                        stream.on('close', function(err, stream) {
                                            alyConn.end();
                                        }).on('data', function(data) {
                                            contentData += data;
                                            res.render('im.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
                                
                            },2000);
                            

                        }).on('data', function(data) {
                            contentData += "\nim消息收到的情况：\n";
                            contentData += data;
                            contentCmd  = "python im.py "+pid+" "+allSingleMsgNum+" "+sendSingleMsgNum+" "+receiveSingleMsgNum+" "+sendGroupMsgNum
                            console.log("contentCmd: "+contentCmd);
                            
                        }).stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                        });

                    });
                    
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
                    if (didStr == "" || didStr == null) {
                        // global.conn.end();
                    }
                    // conn.end();
                }).on('data', function(data) {

                    didStr = (/did=(\d+)/).exec(data);
                    pidStr = (/pid=(\d+)/).exec(data);
                    if (didStr == "" || didStr == null) {
                        contentData += data;
                        res.render('im.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    contentData += data
                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "消息") {
                            allSingleMsgNum = modelsPropertysData[index][1].firstChild.data;
                            sendSingleMsgNum = modelsPropertysData[index][2].firstChild.data;
                            receiveSingleMsgNum = modelsPropertysData[index][3].firstChild.data;
                            sendGroupMsgNum = modelsPropertysData[index][4].firstChild.data;
                            // receiveGroupMsgNum = modelsPropertysData[index][5].firstChild.data;
                            break;
                        };
                    }
                    allSingleMsgNum = (allSingleMsg == "on")?allSingleMsgNum:0;
                    sendSingleMsgNum = (sendSingleMsg == "on")?sendSingleMsgNum:0;
                    receiveSingleMsgNum = (receiveSingleMsg == "on")?receiveSingleMsgNum:0;
                    sendGroupMsgNum = (sendGroupMsg == "on")?sendGroupMsgNum:0;
                    // receiveGroupMsgNum = (receiveGroupMsg = "on")?receiveGroupMsgNum:0;

                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    did = didStr[1];
                    console.log("did: "+did);

                    contentCmd = "mdbg_sh.sh "+did+" imwrk -o exportuser "+"'"+did+" "+pid+"'";
                    global.conn.exec(contentCmd, function(err, stream) {
                        if (err) throw err;
                        stream.on('close', function(err, stream) {
                            // conn.end();
                        }).on('data', function(data) {
                            contentData += "\nim消息收到的情况：\n";
                            contentData += data;
                            contentCmd  = "python im.py "+pid+" "+allSingleMsgNum+" "+sendSingleMsgNum+" "+receiveSingleMsgNum+" "+sendGroupMsgNum
                            console.log("contentCmd: "+contentCmd);
                            global.conn.exec(contentCmd, function(err, stream) {
                                if (err) throw err;
                                stream.on('close', function(err, stream) {
                                    // global.conn.end();
                                }).on('data', function(data) {
                                    contentData += data;
                                    res.render('im.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
    
});



module.exports = router;
