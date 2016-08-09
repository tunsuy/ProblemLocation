#coding:utf-8
#!/usr/bin/python

import pymongo
import os
import sys
import string
import socket
import struct
import time
from  xml.dom import  minidom

reload(sys)
sys.setdefaultencoding("utf-8")

if len(sys.argv) != 4 :
    print "use: " + sys.argv[0] + " pid sendTaskNum receiveTaskNum"
    sys.exit(1)

pid = string.atoi(sys.argv[1])
sendTaskNum = string.atoi(sys.argv[2])
receiveTaskNum = string.atoi(sys.argv[3])

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
tasksTable = mongoConn.task.tasks
creatorTasks = tasksTable.find({"creator.pid":pid}).sort([("create_time", pymongo.DESCENDING)]).limit(sendTaskNum)
headTasks = tasksTable.find({"head.pid":pid}).sort([("create_time", pymongo.DESCENDING)]).limit(receiveTaskNum)
membersTasks = tasksTable.find({"members.pid":{"$in":[pid]}}).sort([("create_time", pymongo.DESCENDING)]).limit(receiveTaskNum)

def taskDataHandler(personType):
    for data in personType:
        printStr = ""
        for key in data.keys():
            if key == "_id" or key == "did" or key == "uid" or key == "token" or key == "reg_id" \
                   or key == "creator" or key == "version" or key == "for_sorting" or key == "tid" or key == "gid":
                continue
            else:
                if key == "create_time" or key == "modify_time":
                    tmptimeStr = time.localtime(float(str(data[key])[0:10]))
                    timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                    printStr += str(key)+": "+str(timeStr)+";  "
                    # print "%s: %s" % (key, timeStr)
                elif key == "head":
                    personDataStr = "{"
                    for personKey in data[key].keys():
                        personDataStr += str(personKey)+":"+str(data[key][personKey])+","
                    printStr += "负责人: "+str(personDataStr)+"; "
                elif key == "modifier":
                    personDataStr = "{"
                    for personKey in data[key].keys():
                        personDataStr += str(personKey)+":"+str(data[key][personKey])+","
                    printStr += "修改者: "+str(personDataStr)+"; "
                elif key == "attr":
                        attrStr = "["
                        for attrData in data[key]:
                            attrSubDataStr = "{"
                            for attrKey in attrData.keys():
                                attrSubDataStr += str(attrKey)+":"+str(attrData[attrKey])+","
                            attrStr += attrSubDataStr+ "},"
                        printStr += str(key)+": "+str(attrStr)+"]; "
                elif key == "members":
                        membersStr = "["
                        for memberData in data[key]:
                            memberStr = "{"
                            for memberKey in memberData.keys():
                                memberStr += str(memberKey)+":"+str(memberData[memberKey])+","
                            membersStr += memberStr+ "},"
                        printStr += "任务成员: "+str(membersStr)+"]; "

                else:
                    printStr += str(key)+": "+str(data[key])+";  "
                    # print "%s: %s" % (key, data[key])

        print printStr
        print "-----------------------------------------"

if sendTaskNum == 0 and receiveTaskNum == 0:
    print "您没有选择任何查询条件！！！"
    sys.exit(0)

if sendTaskNum > 0:
    if creatorTasks.count() == 0 :
        print "该用户发布的任务：无"
    else :
        print ("该用户发布的任务，信息如下：默认 %s 条——可配置" % str(sendTaskNum))
        taskDataHandler(creatorTasks)

if receiveTaskNum > 0:
    if headTasks.count() == 0 and membersTasks.count() == 0:
        print "\n该用户收到的任务：无"
    else:
        if headTasks.count() > 0:
            print ("\n该用户是以下任务的负责人：默认 %s 条——可配置" % str(receiveTaskNum))
            taskDataHandler(headTasks)

        if membersTasks.count() > 0:
            print ("\n该用户是以下任务的成员：默认 %s 条——可配置" % str(receiveTaskNum))
            taskDataHandler(membersTasks)

	





