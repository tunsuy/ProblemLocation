
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
		res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
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
	reqStartTime = req.body['startTime'];
	reqEndTime = req.body['endTime'];
	// var reqServerIP = req.query.id;
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var cmdData = connectServer.connServer(reqServerIP,"get_user_info.py "+reqAccount+"\nexit\n");
	var pid = "", progressIP="", did="";
	var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info "+reqAccount;
	var workatdInfo = "", didStr = "", pidStr = "";

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
				        res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});            	
	            		return;
	            	}
	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("pid: "+pid);
	            	console.log("did: "+did);

	            	// for (var index=0; index<modelsPropertysData.length; index++){
	            	// 	if (modelsPropertysData[index][0].firstChild.data == "考勤") {
	            	// 		progressIP = modelsPropertysData[index][1].firstChild.data;
	            	// 		break;
	            	// 	};
	            	// }
	            	// if (progressIP != 0) {
	            	// 	contentCmd = "mdbg -i "+progressIP+" -p 21024 -o exportdomain "+did;
	            	// }else{
	            	// 	contentCmd = "mdbg -p 21024 -o exportdomain "+did;
	            	// }

	            	
	            	contentCmd = "mdbg -p 21120 -o exportdomain "+did;

	            	alyConn.exec(contentCmd, function(err, stream) {
			            if (err) throw err;
			            stream.on('close', function(err, stream) {
			                // conn.end();
			            }).on('data', function(data) {

			            	var txt=((/0x11[\S\s]*?mdbg_port\((\d+)\)/).exec(data.toString()));

					        var re1='.*?';	// Non-greedy match on filler
					        var re2='((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(?![\\d])';
					        var p = new RegExp(re1+re2,["i"]);
					      	var m = p.exec(txt[0]);
					      	if (m != null)
						    {
						       progressIP=m[1];
						     }
			            	console.log("progressIP: "+progressIP);

			            	var workatdPort = txt[1];
			            	console.log("workatdPort: "+workatdPort);

			            	contentCmd = "mdbg -i "+progressIP+" -p "+workatdPort+" -o getpersonrelateid "+"'did="+did+" pid="+pid+"'";
			            	// if (progressIP != 0) {
			            	// 	contentCmd = "mdbg -i "+progressIP+" -p "+workatdPort+" -o getpersonrelateid "+"'"+did+" "+pid+"'";
			            	// }else{
			            	// 	contentCmd = "mdbg -p "+workatdPort+" -o getpersonrelateid "+"'did="+did+" pid="+pid+"'";
			            	// }

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
								            	contentData += "\n";
								            	contentData += data;
								            	res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
					            	console.log(data.toString());
					            	workatdInfo = (/relate_id=(\d+)/).exec(data.toString());
					            	if (workatdInfo == "" || workatdInfo == null) {
					            		contentData += "\n";
								        contentData += data;
								        contentData += "该公司没有考勤！！！";
								        res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
					            		return;
					            	}
					            	
				            		workatdId = workatdInfo[1];
					            	console.log("workatdID: "+workatdId);
					            	contentCmd = "python workattendance.py "+did+" "+pid+" "+workatdId+" "+reqStartTime+" "+reqEndTime;

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
				        res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});            	
	            		return;
	            	}
	            	contentData += data;
	            	did = didStr[1];
	            	pid = pidStr[1];
	            	console.log("pid: "+pid);
	            	console.log("did: "+did);

	            	// for (var index=0; index<modelsPropertysData.length; index++){
	            	// 	if (modelsPropertysData[index][0].firstChild.data == "考勤") {
	            	// 		progressIP = modelsPropertysData[index][1].firstChild.data;
	            	// 		break;
	            	// 	};
	            	// }
	            	// if (progressIP != 0) {
	            	// 	contentCmd = "mdbg -i "+progressIP+" -p 21024 -o exportdomain "+did;
	            	// }else{
	            	// 	contentCmd = "mdbg -p 21024 -o exportdomain "+did;
	            	// }

	            	
	            	contentCmd = "mdbg -p 21120 -o exportdomain "+did;

	            	global.conn.exec(contentCmd, function(err, stream) {
			            if (err) throw err;
			            stream.on('close', function(err, stream) {
			                // conn.end();
			            }).on('data', function(data) {

			            	var txt=((/0x11[\S\s]*?mdbg_port\((\d+)\)/).exec(data.toString()));

					        var re1='.*?';	// Non-greedy match on filler
					        var re2='((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(?![\\d])';
					        var p = new RegExp(re1+re2,["i"]);
					      	var m = p.exec(txt[0]);
					      	if (m != null)
						    {
						       progressIP=m[1];
						     }
			            	console.log("progressIP: "+progressIP);

			            	var workatdPort = txt[1];
			            	console.log("workatdPort: "+workatdPort);

			            	contentCmd = "mdbg -i "+progressIP+" -p "+workatdPort+" -o getpersonrelateid "+"'did="+did+" pid="+pid+"'";
			            	// if (progressIP != 0) {
			            	// 	contentCmd = "mdbg -i "+progressIP+" -p "+workatdPort+" -o getpersonrelateid "+"'"+did+" "+pid+"'";
			            	// }else{
			            	// 	contentCmd = "mdbg -p "+workatdPort+" -o getpersonrelateid "+"'did="+did+" pid="+pid+"'";
			            	// }

			            	global.conn.exec(contentCmd, function(err, stream) {
					            if (err) throw err;
					            stream.on('close', function(err, stream) {
					            	if (workatdInfo == "" || workatdInfo == null) {
					            		// global.conn.end();
					            		// console.log("关闭连接。。。。。。。。。。。")
					            	}
					                // conn.end();
					            }).on('data', function(data) {
					            	console.log(data.toString());
					            	workatdInfo = (/relate_id=(\d+)/).exec(data.toString());
					            	if (workatdInfo == "" || workatdInfo == null) {
					            		contentData += "\n";
								        contentData += data;
								        contentData += "该公司没有考勤！！！";
								        res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
					            		return;
					            	}
					            	
				            		workatdId = workatdInfo[1];
					            	console.log("workatdID: "+workatdId);
					            	contentCmd = "python workattendance.py "+did+" "+pid+" "+workatdId+" "+reqStartTime+" "+reqEndTime;

					            	global.conn.exec(contentCmd, function(err, stream) {
							            if (err) throw err;
							            stream.on('close', function(err, stream) {
							                // global.conn.end();
							            }).on('data', function(data) {
							            	contentData += "\n";
							            	contentData += data;
							            	res.render('workattendance.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
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
