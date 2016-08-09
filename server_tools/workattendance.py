#coding:utf-8
#!/usr/bin/python

import pymongo
import os
import sys
import string
import socket
import struct
import types
from  xml.dom import  minidom

reload(sys)
sys.setdefaultencoding("utf-8")

if len(sys.argv) < 4 :
    print "use: " + sys.argv[0] + " did pid id {startTime [endTime]}"
    print "id means workattendance id"
    print "startTime means start time of user workattendance"
    print "endTime means end time of user workattendance"
    sys.exit(1)

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

waInfoTable = mongoConn.workattendance.wa_info
waPersonSignTable = mongoConn.workattendance.wa_person_sign

did = string.atoi(sys.argv[1])
pid = string.atoi(sys.argv[2])
workatdId = string.atoi(sys.argv[3])

waPersonSign = ""
startTime = ""
endTime = ""
if len(sys.argv) == 5:
	startTime = string.atoi(sys.argv[4])
	endTime = startTime
	waPersonSign = waPersonSignTable.find({"pid":pid,"date":startTime})
if len(sys.argv) == 6:
	startTime = string.atoi(sys.argv[4])
	endTime = string.atoi(sys.argv[5])
	waPersonSign = waPersonSignTable.find({"pid":pid,"date":{"$gte":startTime,"$lte":endTime}})

workatdInfo = waInfoTable.find({"did":did,"id":workatdId})

if workatdInfo.count() == 0:
    print "该用户所在公司的考勤设置情况：无"
else:
    print "该用户所在公司的考勤设置情况："
    for data in workatdInfo:
        dataStr = ""
        for key in data.keys():
            if key == "_id" or key == "did" or key == "id":
                continue
            else:
                if key == "position":
                    pstStr = ""
                    for pstKey in data[key].keys():
                        pstStr += str(pstKey)+": "+str(data[key][pstKey])+", "
                    dataStr += pstStr+"; "
                else:
                    dataStr += str(key)+": "+str(data[key])+"; "
        print dataStr
        print "-----------------------------------------"

if waPersonSign != "":
    print "\n该用户在这段时间的考勤情况：("+str(startTime)+" - "+str(endTime)+")"
    for data in waPersonSign:
        dataStr = ""
        for key in data.keys():
            if key == "_id" or key == "did" or key == "id" or key == "pid" \
               or key == "gid" or key == "id_and_date" or key == "unique_code" \
               or key == "order_id" or key == "typeinfo" or key == "std_sign_time" \
               or key == "index" or key == "sign_wa_time" or key == "date":
                continue
            else:
                dataStr += str(key)+": "+str(data[key])+"; "
        print dataStr
        print "-----------------------------------------"
else:
    print "\n该用户在这段时间的考勤情况：无"
			




