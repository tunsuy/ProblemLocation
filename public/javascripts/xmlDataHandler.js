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

// function getQuestionsData() {
// 	var questions = select(doc, "/root/model/question");
// 	// console.log(questions);

// 	var propertys = select(doc, "/root/model/question/property");
// 	// console.log(propertys);
// 	var v = propertys[0].firstChild.data;

// 	return propertys;
// }


exports.getModelsAttributesData = getModelsAttributesData;
exports.getModelsPropertysData = getModelsPropertysData;
// exports.getQuestionsData = getQuestionsData;