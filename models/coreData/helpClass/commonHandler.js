//公共文件引入
var xmlDataHandler = require("../../../public/javascripts/xmlDataHandler.js");
var connectServer = require("../../../public/javascripts/connectServer.js");
var shareData = require("../../../models/commons/shareData.js");
var coreOpr = require("../../../models/coreData/helpClass/coreOperate.js");

var async = require('async');

//获取XML文档数据
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

var dbsecServerInfo = xmlDataHandler.getServerInfo("dbsecAccountInfo");
var dbServerInfo = xmlDataHandler.getServerInfo("dbAccountInfo");

var Client = require('ssh2').Client;
var alyConn = new Client();

//实例化公共信息类
var userInfo = new shareData.UserInfo();

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

var contentData = "用户的基本信息：";

//定义数据收集类
function CollectData() {

}

//首次执行命令：获取用户信息
CollectData.prototype.firstCMD = function(req, userOprInfo, callback) {
	var userInfoCMD = "get_user_info "+userOprInfo.get().reqAccount;
	console.log("userInfoCMD: "+userInfoCMD);

	console.dir(req.session);

	if (req.session.alyFlag == "aly") {
		return userInfo.connExec(req, alyConn, userOprInfo, userInfoCMD, callback);
	}

	return userInfo.connExec(req, req.session.conn, userOprInfo, userInfoCMD, callback);
}

//增加用户信息到输出内容中
CollectData.prototype.addUserInfo = function(req, userOprInfo, data, callback) {
	console.log("userInfo: "+data);
	contentData += ("\n"+data);
	return callback(null, req, userOprInfo, data);
}

//输出内容到view层
CollectData.prototype.putoutToView = function(userOprInfo, data, req, res, rdView) {
	console.log("返回内容: "+data);
	res.render(rdView, { 
		modelsAttributes: modelsAttributesData, 
		modelsPropertys: modelsPropertysData, 
		serverIP: req.session.reqServerIP, 
		account: userOprInfo.get().reqAccount, 
		content: data
	});
	return;
}

//使用async处理异步回调
CollectData.prototype.asyncHandler = function(userOprInfo, callbackArr, req, res, rdView) {
	var self = this; //保存当前上下文，用于下面的function调用
	async.waterfall(callbackArr, function(err, result) {
		if (err) {
			console.log("err: "+err);
			contentData += ("\n"+err);
			// self.putoutToView(userOprInfo, contentData, req, res, rdView);
			// return;
		}
		contentData += ("\n"+result);
		self.putoutToView(userOprInfo, contentData, req, res, rdView);
	});
}

//conn exec CMD 回调
CollectData.prototype.cbNextCMDFromUserInfo = function(req, nextCMD, callback) {
	console.dir(req.session);
	if (req.session.alyFlag == "aly") {
		return callback(null, alyConn, nextCMD);
	} 

	return callback(null, req.session.conn, nextCMD);
}

//aly特殊情况：需要切换服务器
CollectData.prototype.changeServer = function(conn, CMD, callback) {
	conn.end();
	conn.on('ready', function() {
		moduleInfo.connExec(conn, CMD, callback);	
	}).connect({
        host: dbsecServerInfo.ip,
        port: 22,
        username: dbsecServerInfo.userName,
        password: dbsecServerInfo.passWord
    });
}

//aly特殊情况
CollectData.prototype.alyAsyncHandler = function(userOprInfo, callbackArr, res, rdView) {
	var self = this; //保存当前上下文，用于下面的function调用
	alyConn.on('ready', function() {
		self.asyncHandler(userOprInfo, callbackArr, res, rdView);
	}).connect({
        host: dbsecServerInfo.ip,
        port: 22,
        username: dbsecServerInfo.userName,
        password: dbsecServerInfo.passWord
    });
}

//允许外部传入内容
CollectData.prototype.receiveExtContent = function(extContent) {
	console.log("extContent: "+extContent);
	contentData += ("\n"+extContent);
}

//定义get路由的操作类
function RouterGet() {
	
}

RouterGet.prototype.renderView = function(req, res, rdView) {
	if (req.session.reqServerIP) {
		res.render(rdView, { 
			modelsAttributes: modelsAttributesData, 
			modelsPropertys: modelsPropertysData, 
			serverIP: req.session.reqServerIP, 
			account: "", 
			content: ""
		});
	}else{
		res.redirect('/');
	}
}

exports.CollectData = CollectData;
exports.RouterGet = RouterGet;

exports.userInfo = userInfo;
exports.moduleInfo = moduleInfo;