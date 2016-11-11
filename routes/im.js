var LoggerHelper = require("../helper/log4jsHandle.js").LoggerHelper; 
var loggerHelper = new LoggerHelper('im.js');

var commonHandler = require("../models/coreData/helpClass/commonHandler.js");
var shareModels = require("../models/coreData/helpClass/shareModels.js");
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var coreOpr = require("../models/coreData/helpClass/coreOperate.js");

var express = require('express');
var router = express.Router();

var routerGet = new commonHandler.RouterGet();

router.get('/', function(req, res, next) {
    loggerHelper.writeInfo("登录的服务器为："+req.session.reqServerIP);
    routerGet.renderView(req, res, "im.ejs");
});

//实例化公共逻辑-数据收集类
var collectData = new commonHandler.CollectData();

//来自commonHandler的共享对象
var userInfo = commonHandler.userInfo;

//实例化模块Conn操作类
var moduleInfo = new coreOpr.Info();

//获取XML文档数据
var modelsPropertysData = xmlDataHandler.getModelsPropertysData();

//获取下一步操作的命令
var nextCMDFromUserInfo = function(req, userOprInfo, userBaseInfo, callback) {
    var allSingleMsgNum, sendSingleMsgNum, receiveSingleMsgNum, sendGroupMsgNum;
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
    allSingleMsgNum = (userOprInfo.get().allSingleMsg == "on")?allSingleMsgNum:0;
    sendSingleMsgNum = (userOprInfo.get().sendSingleMsg == "on")?sendSingleMsgNum:0;
    receiveSingleMsgNum = (userOprInfo.get().receiveSingleMsg == "on")?receiveSingleMsgNum:0;
    sendGroupMsgNum = (userOprInfo.get().sendGroupMsg == "on")?sendGroupMsgNum:0;

    var nextCMD = "python im.py "+userBaseInfo.pid+" "+allSingleMsgNum+" "+
        sendSingleMsgNum+" "+receiveSingleMsgNum+" "+sendGroupMsgNum;

    console.log("nextCMD: "+nextCMD);

    collectData.cbNextCMDFromUserInfo(req, nextCMD, callback);
}

router.post('/', function(req, res, next) {
	var reqAccount = req.body['account'];
    global.accountCache = req.body['account'];
    var allSingleMsg = req.body['allSingleMsg'];
    var sendSingleMsg = req.body['sendSingleMsg'];
    var receiveSingleMsg = req.body['receiveSingleMsg'];
    var sendGroupMsg = req.body['sendGroupMsg'];

    //实例化用户操作类
    var userOprInfo = new shareModels.UserOprInfo();
    userOprInfo.set({
        reqAccount: reqAccount,
        allSingleMsg: allSingleMsg,
        sendSingleMsg: sendSingleMsg,
        receiveSingleMsg: receiveSingleMsg,
        sendGroupMsg: sendGroupMsg
    });

    var callbackArr;

    if (req.session.alyFlag == "aly") {
        //针对aly服务器
        callbackArr = [
            function(callback) {
                collectData.firstCMD(req, userOprInfo, callback);
            },
            userInfo.streamOpr,
            collectData.addUserInfo,
            userInfo.getBase,
            nextCMDFromUserInfo,
            collectData.changeServer,
            moduleInfo.streamOpr
        ];

        collectData.alyAsyncHandler(userOprInfo, callbackArr, req, res, "im.ejs");
    }
    else if (!req.session.conn) {
        res.redirect('/');
    }
    else {
        //针对普通服务器
        callbackArr = [
            function(callback) {
                collectData.firstCMD(userOprInfo, callback);
            },
            userInfo.streamOpr,
            collectData.addUserInfo,
            userInfo.getBase,
            nextCMDFromUserInfo,
            moduleInfo.connExec,
            moduleInfo.streamOpr
        ];
        
        asyncHandler(userOprInfo, callbackArr, req, res, "im.ejs");
    }

});

module.exports = router;
