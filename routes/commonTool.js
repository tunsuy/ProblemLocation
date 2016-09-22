
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

	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
	console.log("登录的服务器为："+global.reqServerIP);
	if (global.reqServerIP) {
		res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: "", GMTContent: "", generalTimeContent: ""});
	}else{
		res.redirect('/');
	}
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {

	var reqId = req.query.id;
	var decode = req.body['decode'];
	var GMT = req.body['GMT'];
	var generalTime = req.body['generalTime'];

	switch(parseInt(reqId)){
		case 1:
			contentCmd = "keycode ude " + decode;
			contentData = decode + ": \n";
			break;
		case 2:
			contentCmd = "date -d @" + GMT.substring(0,10);
			contentData = GMT + ": ";
			break;
		case 3:
			contentCmd = "date +%s -d " + "'" + generalTime + "'";
			contentData = generalTime + ": ";
			break;
		default:
	}

	var Client = require('ssh2').Client;
	var alyConn = new Client();
	console.log("contentCmd: "+contentCmd);
	if (global.alyFlag == "aly") {
		alyConn.on('ready', function() {
	        alyConn.exec(contentCmd, function(err, stream) {
	            if (err) throw err;
	            stream.on('close', function(err, stream) {
	                // conn.end();
	            }).on('data', function(data) {

	            	contentData +=data;
	            	switch(parseInt(reqId)){
						case 1:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: contentData, GMTContent: "", generalTimeContent: ""});
							break;
						case 2:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: "", GMTContent: contentData, generalTimeContent: ""});
							break;
						case 3:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: "", GMTContent: "", generalTimeContent: contentData});
							break;
						default:
					}
	                
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
	                // conn.end();
	            }).on('data', function(data) {

	            	contentData +=data;
	            	switch(parseInt(reqId)){
						case 1:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: contentData, GMTContent: "", generalTimeContent: ""});
							break;
						case 2:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: "", GMTContent: contentData, generalTimeContent: ""});
							break;
						case 3:
							res.render('commonTool.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, decodeContent: "", GMTContent: "", generalTimeContent: contentData});
							break;
						default:
					}
	                
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
