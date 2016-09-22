// 加载xml文档

var rf=require("fs");
var push=rf.readFileSync("xml/push.xml","utf-8");
var im=rf.readFileSync("xml/im.xml","utf-8");
var loginRelate=rf.readFileSync("xml/loginRelate.xml","utf-8");
var task=rf.readFileSync("xml/task.xml","utf-8");
var workattendance=rf.readFileSync("xml/workattendance.xml","utf-8");
var workReport=rf.readFileSync("xml/workReport.xml","utf-8");
var workFlowed=rf.readFileSync("xml/workFlowed.xml","utf-8");
var commonTool=rf.readFileSync("xml/commonTool.xml","utf-8");
var customer=rf.readFileSync("xml/customer.xml","utf-8");
var cloudDisk=rf.readFileSync("xml/cloudDisk.xml","utf-8");
var privilege=rf.readFileSync("xml/privilege.xml","utf-8");
var webapp=rf.readFileSync("xml/webapp.xml","utf-8");
var legwork=rf.readFileSync("xml/legwork.xml","utf-8");

/** 使用xpath处理 */

var select = require('xpath.js');
var dom = require('xmldom').DOMParser;

var pushData = new dom().parseFromString(push); 
var imData = new dom().parseFromString(im); 
var loginRelateData = new dom().parseFromString(loginRelate); 
var taskData = new dom().parseFromString(task); 
var workattendanceData = new dom().parseFromString(workattendance); 
var workReportData = new dom().parseFromString(workReport); 
var workFlowedData = new dom().parseFromString(workFlowed); 
var commonToolData = new dom().parseFromString(commonTool);
var customerData = new dom().parseFromString(customer); 
var cloudDiskData = new dom().parseFromString(cloudDisk); 
var privilegeData = new dom().parseFromString(privilege); 
var webappData = new dom().parseFromString(webapp);
var legworkData = new dom().parseFromString(legwork);
var configData = new dom().parseFromString(config);

function getModelsAttributesData() {
 	var pushAttributes = select(pushData, "/root/model");
 	// console.log(pushAttributes[0].attributes);
 	// console.log(pushAttributes[0].attributes[0].nodeValue);
 	var imAttributes = select(imData, "/root/model");
	var loginRelateAttributes = select(loginRelateData, "/root/model");
	var taskAttributes = select(taskData, "/root/model");
	var workattendanceAttributes = select(workattendanceData, "/root/model");
	var workReportAttributes = select(workReportData, "/root/model");
	var workFlowedAttributes = select(workFlowedData, "/root/model");
	var commonToolAttributes = select(commonToolData, "/root/model");
	var customerAttributes = select(customerData, "/root/model");
	var cloudDiskAttributes = select(cloudDiskData, "/root/model");
	var privilegeAttributes = select(privilegeData, "/root/model");
	var webappAttributes = select(webappData, "/root/model");
	var legworkAttributes = select(legworkData, "/root/model");

	var modelsAttributes = new Array(pushAttributes,workattendanceAttributes,workFlowedAttributes,webappAttributes,privilegeAttributes,customerAttributes,cloudDiskAttributes,imAttributes,taskAttributes,workReportAttributes,legworkAttributes,commonToolAttributes);

	return modelsAttributes;
}


 function getModelsPropertysData() {
	var pushProperty = select(pushData, "/root/model/property");
	var imProperty = select(imData, "/root/model/property");
	var loginRelateProperty = select(loginRelateData, "/root/model/property");
	var taskProperty = select(taskData, "/root/model/property");
	var workattendanceProperty = select(workattendanceData, "/root/model/property");
	var workReportProperty = select(workReportData, "/root/model/property");
	var workFlowedProperty = select(workFlowedData, "/root/model/property");
	var commonToolProperty = select(commonToolData, "/root/model/property");
	var customerProperty = select(customerData, "/root/model/property");
	var cloudDiskProperty = select(cloudDiskData, "/root/model/property");
	var privilegeProperty = select(privilegeData, "/root/model/property");
	var webappProperty = select(webappData, "/root/model/property");
	var legworkProperty = select(legworkData, "/root/model/property");

	var modelsPropertys = new Array(pushProperty,workattendanceProperty,workFlowedProperty,webappProperty,privilegeProperty,customerProperty,cloudDiskProperty,imProperty,taskProperty,workReportProperty,legworkProperty,commonToolProperty);

	return modelsPropertys;
}

// function getServerInfo() {
	// var configAttributes = select(configData, "/root/server/@id");
	// var configProperty = select(configData, "/root/server/property");
	// console.log(configAttributes.nodeName)
	// for (var i = configAttributes.length - 1; i >= 0; i--) {
	// 	console.log(configAttributes[i].value);
		// console.log(configAttributes[i].ownerElement.childNodes);
		// var srvChildNodes = configAttributes[i].ownerElement.childNodes;
		// for (var j = srvChildNodes.length - 1; j >= 0; j--) {
		// 	if (srvChildNodes[j].nodeName == "property") {
				// var configProperty = select(configData, "/root/server/property/@name");
				// for (var k = configProperty.length - 1; k >= 0; k--) {
				// 	console.log(configProperty[k].value);
				// }
				// console.log(srvChildNodes[j].firstChild.data)
	// 			console.log(srvChildNodes[j].ownerDocument.childNodes.attributes)
	// 		}
	// 	}
	// }
	// console.log(configAttributes)
	// console.log(configAttributes[0][@id="dbAccountInfo"])
	// console.log(configProperty[5])
	// return new Array(configAttributes, configProperty);
// }

// function getQuestionsData() {
// 	var questions = select(doc, "/root/model/question");
// 	// console.log(questions);

// 	var propertys = select(doc, "/root/model/question/property");
// 	// console.log(propertys);
// 	var v = propertys[0].firstChild.data;

// 	return propertys;
// }

/** 使用xml2js处理 */

var parseString = require('xml2js').parseString;
var config=rf.readFileSync("xml/config.xml","utf-8");

function getServerInfo(serverName) {
	var serverInfo = new Array();
	parseString(config, { explicitArray : false }, function (err, result) {
    	var jsonStr = JSON.stringify(result);
    	var json = JSON.parse(jsonStr);
    	var servers = json.root.server;
    	for (var i = servers.length - 1; i >= 0; i--) {
    		if (servers[i].$.id == serverName) {
    			var propertys = servers[i].property;
    			for (var j = propertys.length - 1; j >= 0; j--) {
    				serverInfo[propertys[j].$.name] = propertys[j]._;
    			}
    			break;
    		}
    	}
	});
	return serverInfo;
}

exports.getModelsAttributesData = getModelsAttributesData;
exports.getModelsPropertysData = getModelsPropertysData;
exports.getServerInfo = getServerInfo;
// exports.getQuestionsData = getQuestionsData;