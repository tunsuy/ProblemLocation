#coding:utf-8
#!/usr/bin/python

import pymongo
import os
import sys
import string
import socket
import struct
import time
import base64
from  xml.dom import  minidom

reload(sys)
sys.setdefaultencoding("utf-8")

if len(sys.argv) != 6 :
    print "use: " + sys.argv[0] + " uid pushServerFlag userSettingFlag pushMsgCount pushUserEventCount"
    print "pushServerFlag=[1|0], userSettingFlag=[1|0], 1 means input the info"
    print "pushMsgCount=0, pushUserEventCount=0 means not set"
    sys.exit(1)

uid = string.atoi(sys.argv[1])
pushServerFlag = string.atoi(sys.argv[2])
userSettingFlag = string.atoi(sys.argv[3])
pushMsgCount = string.atoi(sys.argv[4])
pushUserEventCount = string.atoi(sys.argv[5])

def get_ip():
    filename = "/etc/sangfor/moa/moa.xml"
    doc = minidom.parse(filename)
    root = doc.firstChild
    childs = root.childNodes
    ip = "/tmp/mongodb-27017.sock"
    for child in childs:
        if child.nodeType == child.TEXT_NODE:
            pass
        else:
            if child.getAttribute("name") == "mongodb_ip":
              ip = child.childNodes[0].data
    return ip
def get_port():
    filename = "/etc/sangfor/moa/moa.xml"
    doc = minidom.parse(filename)
    root = doc.firstChild
    childs = root.childNodes
    port = -1
    for child in childs:
        if child.nodeType == child.TEXT_NODE:
            pass
        else:
            if child.getAttribute("name") == "mongodb_port":
              port = child.childNodes[0].data
    return int(port)
def get_auth():
    filename = "/etc/sangfor/moa/moa.xml"
    doc = minidom.parse(filename)
    root = doc.firstChild
    childs = root.childNodes
    auth_flag = -1
    for child in childs:
        if child.nodeType == child.TEXT_NODE:
            pass
        else:
            if child.getAttribute("name") == "mongodb_need_auth":
              auth_flag = child.childNodes[0].data
    return int(auth_flag)
ip = get_ip()
port = get_port()
mongoConn = pymongo.Connection(ip, port)
auth_flag = get_auth()
if auth_flag == 1:
    out=os.popen("/usr/bin/mongo_user admin 1").read()
    account=out.split(' ')
    mongoConn.admin.authenticate(account[0],account[1])

# mongoConn = pymongo.Connection("/tmp/mongodb-27017.sock", -1)
pushMsgTable = mongoConn.Push.PushMsg
pushUserDeviceTable = mongoConn.Push.UserDevice
pushUserSettingTable = mongoConn.Push.UserSetting
pushUserEventTable = mongoConn.Push.UserEvent

pushUserDevice = pushUserDeviceTable.find({"uid":uid})
pushUserSetting = pushUserSettingTable.find({"uid":uid})

if pushServerFlag == 0 and userSettingFlag == 0 and pushMsgCount == 0 and pushUserEventCount == 0:
	print "\n您没有选择任何查询条件！！"
	sys.exit(0)

if pushServerFlag == 1:
	if pushUserDevice.count() == 0 :
		print "该用户设备没有注册推送服务"
	else :
		print "该用户设备已经注册推送服务，信息如下："
		for data in pushUserDevice:
			printStr = ""
			for key in data.keys():
						if key == "_id" or key == "did" or key == "uid" or key == "token" or key == "reg_id":
							continue
						else:
							if key == "time":
								tmptimeStr = time.localtime(float(str(data[key])[0:10]))
								timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
								printStr += str(key)+": "+str(timeStr)+";  "
								# print "%s: %s" % (key, timeStr)
							else:
								printStr += str(key)+": "+str(data[key])+";  "
								# print "%s: %s" % (key, data[key])

			print printStr
			print "-----------------------------------------"

if userSettingFlag == 1:
	if pushUserSetting.count() == 0:
		print "\n该用户没有设置免扰"
	else :
		print "\n该用户设置了免扰，信息如下:"
		for data in pushUserSetting:
			printStr = ""
			for key in data.keys():
						if key == "_id" or key == "did" or key == "uid" or key == "time" or key == "readable_time":
							continue
						else:
							printStr += str(key)+": "+str(data[key])+";  "
							# print "%s: %s" % (key, data[key])

			print printStr
			print "-----------------------------------------"

if pushMsgCount > 0:
	if pushMsgTable.find({"uid":uid}).sort([("time", pymongo.DESCENDING)]).limit(pushMsgCount).count() == 0:
		print "\n该用户最近的推送消息情况：无"
	else:
		print ("\n该用户最近的推送消息情况：默认 %s 条——可配置" % str(pushMsgCount))
		for data in pushMsgTable.find({"uid":uid}).sort([("time", pymongo.DESCENDING)]).limit(pushMsgCount) :
			print "------------------------------------------"
			for key in data.keys():
				if key == "_id" or key == "did" or key == "uid" or key == "send_id" or key == "token" or key == "id":
					continue
				else:
					if key == "time":
						tmptimeStr = time.localtime(float(str(data[key])[0:10]))
						timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
						print "%s: %s" % (key, timeStr)
					else:
						print "%s: %s" % (key, data[key])
			

if pushUserEventCount > 0:
	if pushUserEventTable.find({"uid":uid}).sort([("time", pymongo.DESCENDING)]).limit(pushUserEventCount).count() == 0:
		print "\n该用户最近的登录注销情况：无"
	else:
		print ("\n该用户最近的登录注销情况：默认 %s 条——可配置" % str(pushUserEventCount))
		for data in pushUserEventTable.find({"uid":uid}).sort([("time", pymongo.DESCENDING)]).limit(pushUserEventCount) :
			printStr = ""
			print "--------------------------------------------"
			for key in data.keys():
				if key == "_id" or key == "did" or key == "uid" or key == "token" or key == "device_token":
					continue
				else:
					if key == "time":
						tmptimeStr = time.localtime(float(str(data[key])[0:10]))
						timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
						printStr += str(key)+": "+str(timeStr)+";  "
						# print "%s: %s" % (key, timeStr)
					else:
						printStr += str(key)+": "+str(data[key])+";  "
						# print "%s: %s" % (key, data[key])

			print printStr
		



