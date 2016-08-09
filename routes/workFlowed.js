
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
		res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP:  global.reqServerIP, account: "", content: ""});
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
    applying = req.body['applying'];
    rejected = req.body['rejected'];
    handling = req.body['handling'];
    handled = req.body['handled'];
    copyme = req.body['copyme'];
	// var reqServerIP = req.query.id;
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var cmdData = connectServer.connServer(reqServerIP,"get_user_info.py "+reqAccount+"\nexit\n");
	var pid = "", progressIP="", applyingNum="", rejectedNum="", handlingNum="", handledNum="", copymeNum="";
    var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info.py "+reqAccount;
    var pidStr = "";

	var Client = require('ssh2').Client;
	var alyConn = new Client();

    if (global.alyFlag == "aly") {
        alyConn.on('ready', function() {
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
                                contentData += "\n"
                                contentData += data;
                                console.log("返回内容: "+contentData);
                                res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                                return;
                            }).stderr.on('data', function(data) {
                                console.log('STDERR: ' + data);
                                contentData += "\n"
                                contentData += data;
                                contentData += "该服务器不支持MysqlDB环境，请联系ts配置";
                                res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                                return;
                            });

                        });
                                                           
                    }).connect({
                        host: "115.29.98.162",
                        port: 22,
                        username: "frontground",
                        password: "873b9673fdb5f532"
                    });

                }).on('data', function(data) {

                    pidStr = (/pid=(\d+)/).exec(data);
                    if (pidStr == "" || pidStr == null) {
                        contentData += data;
                        res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    contentData += data
                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "流程") {
                            progressIP = modelsPropertysData[index][1].firstChild.data;
                            applyingNum = modelsPropertysData[index][2].firstChild.data;
                            rejectedNum = modelsPropertysData[index][3].firstChild.data;
                            handlingNum = modelsPropertysData[index][4].firstChild.data;
                            handledNum = modelsPropertysData[index][5].firstChild.data;
                            copymeNum = modelsPropertysData[index][6].firstChild.data;
                            userAccount = modelsPropertysData[index][7].firstChild.data;
                            password = modelsPropertysData[index][8].firstChild.data;
                            break;
                        };
                    }
                    applyingNum = (applying == "on")?applyingNum:0;
                    rejectedNum = (rejected == "on")?rejectedNum:0;
                    handlingNum = (handling == "on")?handlingNum:0;
                    handledNum = (handled == "on")?handledNum:0;
                    copymeNum = (copyme = "on")?copymeNum:0;

                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    console.log(progressIP);

                    if (progressIP != "0") {
                        contentCmd = "python workFlowed.py "+userAccount+" "+password+" "+pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+" "+handledNum+" "+copymeNum+" "+progressIP;
                    }else{
                        contentCmd = "python workFlowed.py "+userAccount+" "+password+" "+pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+" "+handledNum+" "+copymeNum;
                    }
                    
                    console.log("contentCmd："+contentCmd);
                    
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
                    if (pidStr == "" || pidStr == null) {
                        // global.conn.end();
                    }
                    // conn.end();
                }).on('data', function(data) {

                    pidStr = (/pid=(\d+)/).exec(data);
                    if (pidStr == "" || pidStr == null) {
                        contentData += data;
                        res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    contentData += data
                    for (var index=0; index<modelsPropertysData.length; index++){
                        if (modelsPropertysData[index][0].firstChild.data == "流程") {
                            progressIP = modelsPropertysData[index][1].firstChild.data;
                            applyingNum = modelsPropertysData[index][2].firstChild.data;
                            rejectedNum = modelsPropertysData[index][3].firstChild.data;
                            handlingNum = modelsPropertysData[index][4].firstChild.data;
                            handledNum = modelsPropertysData[index][5].firstChild.data;
                            copymeNum = modelsPropertysData[index][6].firstChild.data;
                            userAccount = modelsPropertysData[index][7].firstChild.data;
                            password = modelsPropertysData[index][8].firstChild.data;
                            break;
                        };
                    }
                    applyingNum = (applying == "on")?applyingNum:0;
                    rejectedNum = (rejected == "on")?rejectedNum:0;
                    handlingNum = (handling == "on")?handlingNum:0;
                    handledNum = (handled == "on")?handledNum:0;
                    copymeNum = (copyme = "on")?copymeNum:0;

                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    console.log(progressIP);

                    if (progressIP != "0") {
                        contentCmd = "python workFlowed.py "+userAccount+" "+password+" "+pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+" "+handledNum+" "+copymeNum+" "+progressIP;
                    }else{
                        contentCmd = "python workFlowed.py "+userAccount+" "+password+" "+pid+" "+applyingNum+" "+rejectedNum+" "+handlingNum+" "+handledNum+" "+copymeNum;
                    }
                    
                    console.log("contentCmd："+contentCmd);
                    global.conn.exec(contentCmd, function(err, stream) {
                        if (err) throw err;
                        stream.on('close', function(err, stream) {
                            // global.conn.end();
                        }).on('data', function(data) {
                            contentData += "\n"
                            contentData += data;
                            console.log("返回内容: "+contentData);
                            res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                            return;
                        }).stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                            contentData += "\n"
                            contentData += data;
                            contentData += "该服务器不支持MysqlDB环境，请联系ts配置";
                            res.render('workFlowed.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                            return;
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
