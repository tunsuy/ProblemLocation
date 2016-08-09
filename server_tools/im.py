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
    print "use: " + sys.argv[0] + " pid allSingleMsgNum sendSingleMsgNum receiveSingleMsgNum sendGroupMsgNum"
    sys.exit(1)

pid = string.atoi(sys.argv[1])
allSingleMsgNum = string.atoi(sys.argv[2])
sendSingleMsgNum = string.atoi(sys.argv[3])
receiveSingleMsgNum = string.atoi(sys.argv[4])
sendGroupMsgNum = string.atoi(sys.argv[5])
# receiveGroupMsgNum = string.atoi(sys.argv[6])

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
userMsgTable = mongoConn.im.user_msg
groupMsgTable = mongoConn.im.group_msg
allSingleMsgs = userMsgTable.find({"pid":pid}).sort([("arrivetime", pymongo.DESCENDING)]).limit(allSingleMsgNum)
sendSingelMsgs = userMsgTable.find({"from_pid":pid}).sort([("arrivetime", pymongo.DESCENDING)]).limit(sendSingleMsgNum)
receiveSingleMsgs = userMsgTable.find({"to_pid":pid}).sort([("arrivetime", pymongo.DESCENDING)]).limit(receiveSingleMsgNum)
sendGroupMsgs = groupMsgTable.find({"from_pid":pid}).sort([("arrivetime", pymongo.DESCENDING)]).limit(sendGroupMsgNum)
# receiveGroupMsgs = groupMsgTable.find({"to_pid":pid}).sort([("arrivetime", pymongo.DESCENDING)]).limit(receiveGroupMsgNum)

if allSingleMsgNum == 0 and sendSingleMsgNum == 0 and receiveSingleMsgNum == 0 and sendGroupMsgNum == 0:
    print "您没有选择任何查询条件！！！"
    sys.exit(0)

def handleSingleMsgs(msgNum,msgs,tip):
    if msgNum > 0:
        if msgs.count() == 0:
            print ("该用户单聊消息的%s情况：无" % tip)
        else:
            print ("该用户单聊消息的%s情况：默认 %s 条——可配置" % (tip, str(msgNum)))
            for data in msgs:
                printStr = ""
                for key in data.keys():
                    if key == "_id" or key == "did" or key == "pid" or key == "msg_id" \
                        or key == "from_did" or key == "to_did" or key == "from_name" or key == "contents" \
                        or key == "associate_id" or key == "client_msg_id":
                        continue
                    else:
                        if key == "arrivetime":
                            tmptimeStr = time.localtime(float(str(data[key])[0:10]))
                            timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                            printStr += str(key)+": "+str(timeStr)+";  "
                        elif key == "atts":
                            attsStr = "["
                            for attsData in data[key]:
                                for attsKey in attsData.keys():
                                    if attsKey == "type":
                                        continue
                                    else:
                                        attsStr += str(attsKey)+":"+str(attsData[attsKey])+","
                            printStr += str(key)+": "+str(attsStr)+"]; "
                        else:
                            printStr += str(key)+": "+str(data[key])+";  "
                print printStr
                print "-----------------------------------------"

handleSingleMsgs(allSingleMsgNum,allSingleMsgs,"收发")
handleSingleMsgs(sendSingleMsgNum,sendSingelMsgs,"发送")
handleSingleMsgs(receiveSingleMsgNum,receiveSingleMsgs,"接收")

def handleGroupMsgs(msgNum,msgs,tip):
    if msgNum > 0:
        if msgs.count() == 0:
            print ("\n该用户群聊消息的%s情况：无" % tip)
        else:
            print ("\n该用户群聊消息的%s情况：默认 %s 条——可配置" % (tip, str(msgNum)))
            for data in msgs:
                printStr = ""
                for key in data.keys():
                    if key == "_id" or key == "did" or key == "msg_id" \
                        or key == "from_pid" or key == "to_did" or key == "gid" or key == "from_name" \
                        or key == "contents" or key == "client_msg_id":
                        continue
                    else:
                        if key == "arrivetime":
                            tmptimeStr = time.localtime(float(str(data[key])[0:10]))
                            timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                            printStr += str(key)+": "+str(timeStr)+";  "
                        elif key == "atts":
                            attsStr = "["
                            for attsData in data[key]:
                                for attsKey in attsData.keys():
                                    if attsKey == "type":
                                        continue
                                    else:
                                        attsStr += str(attsKey)+":"+str(attsData[attsKey])+","
                            printStr += str(key)+": "+str(attsStr)+"]; "
                        else:
                            printStr += str(key)+": "+str(data[key])+";  "
                print printStr
                print "-----------------------------------------"

handleGroupMsgs(sendGroupMsgNum,sendGroupMsgs,"发送")
# handleGroupMsgs(receiveGroupMsgNum,receiveGroupMsgs,"接收")








