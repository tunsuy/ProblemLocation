var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('commonTool.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var coreOpr = require("../models/coreData/helpClass/coreOperate.js");

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
	loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
	routerGet.renderView(req, res, "commonTool.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

//获取下一步操作的命令
var theCMD = function(userOprInfo, callback) {
	var nextCMD;
	switch(parseInt(userOprInfo.get().reqId)){
		case 1:
			nextCMD = "keycode ude " + userOprInfo.get().decode;
			collectData.receiveExtContent(userOprInfo.get().decode + ": \n");
			break;
		case 2:
			nextCMD = "date -d @" + userOprInfo.get().GMT.substring(0,10);
			collectData.receiveExtContent(userOprInfo.get().GMT + ": ");
			break;
		case 3:
			nextCMD = "date +%s -d " + "'" + userOprInfo.get().generalTime + "'";
			collectData.receiveExtContent(userOprInfo.get().generalTime + ": ");
			break;
		default:
	}

	loggerHelper.writeInfo("nextCMD: "+nextCMD);

	collectData.cbNextCMDFromUserInfo(nextCMD, callback);
}

//逻辑不一样：这里不能使用commonHandler公共的方法
var putoutToView = function(userOprInfo, data, req, res, rdView) {
	loggerHelper.writeInfo("返回内容: "+data);

	switch(parseInt(userOprInfo.get().reqId)){
		case 1:
			res.render(rdView, { 
				modelsAttributes: modelsAttributesData, 
				modelsPropertys: modelsPropertysData, 
				serverIP: req.session.reqServerIP, 
				decodeContent: contentData, 
				GMTContent: "", 
				generalTimeContent: ""
			});
			break;
		case 2:
			res.render(rdView, { 
				modelsAttributes: modelsAttributesData, 
				modelsPropertys: modelsPropertysData, 
				serverIP: req.session.reqServerIP, 
				decodeContent: "", 
				GMTContent: contentData, 
				generalTimeContent: ""
			});
			break;
		case 3:
			res.render(rdView, { 
				modelsAttributes: modelsAttributesData, 
				modelsPropertys: modelsPropertysData, 
				serverIP: req.session.reqServerIP, 
				decodeContent: "", 
				GMTContent: "", 
				generalTimeContent: contentData
			});
			break;
		default:
	}

	return;
}

var asyncHandler = function(userOprInfo, callbackArr, req, res, rdView) {
	async.waterfall(callbackArr, function(err, result) {
		if (err) {
			loggerHelper.writeErr("err: "+err);
			contentData += ("\n"+err);
			putoutToView(userOprInfo, contentData, req, res, rdView);
			return;
		}
		contentData += ("\n"+result);
		putoutToView(userOprInfo, contentData, req, res, rdView);
	});
}

router.post('/', function(req, res, next) {
	var reqId = req.query.id;
	var decode = req.body['decode'];
	var GMT = req.body['GMT'];
	var generalTime = req.body['generalTime'];

	//实例化用户操作类
	var userOprInfo = new shareModels.UserOprInfo();
	userOprInfo.set({
		reqId: reqId,
		decode: decode,
		GMT: GMT,
		generalTime: generalTime
	});

	var callbackArr;

	if (!req.session.conn) {
		res.redirect('/');
	}
	else {
		//针对普通服务器
		callbackArr = [
			function(callback) {
				theCMD(userOprInfo, callback);
			},
			moduleInfo.connExec,
			moduleInfo.streamOpr
		];
		
		asyncHandler(userOprInfo, callbackArr, req, res, "commonTool.ejs");
	}

});


module.exports = router;
