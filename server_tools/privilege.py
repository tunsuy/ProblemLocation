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
    print "use: " + sys.argv[0] + " did pid lookPermitFlag notifyPermitFlag permitAllocationFlag"
    sys.exit(1)

did = string.atoi(sys.argv[1])
pid = string.atoi(sys.argv[2])
lookPermitFlag = string.atoi(sys.argv[3])
notifyPermitFlag = string.atoi(sys.argv[4])
permitAllocationFlag = string.atoi(sys.argv[5])

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
pmtTable = mongoConn.Permit.Pmt
privilegeInfoTable = mongoConn.privilege.privilege_info
manitemsTable = mongoConn.privilege.manitems

lookPermit = pmtTable.find({"uid":pid})
notifyPermit = privilegeInfoTable.find({"did":did,"pa":1,"privileges.module":{"$in":[1]}})
permitAllocation = manitemsTable.find({"did":did})

if lookPermitFlag == 0 and notifyPermitFlag == 0 and permitAllocationFlag == 0:
    print "您没有选择任何查询条件！！！"
    sys.exit(0)

if lookPermitFlag == 1:
    if lookPermit.count() == 0 :
        print "\n该用户的工作汇报、CRM、云盘权限：无"
    else :
        print "\n该用户的工作汇报、CRM、云盘权限："
        for data in lookPermit:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did" or key == "uid" or key == "sortid":
                    continue
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"

if notifyPermitFlag == 1:
    if notifyPermit.count() == 0 :
        print "\n该用户的通知权限：无"
    else :
        print "\n该用户的通知权限："
        for data in notifyPermit:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did" or key == "id" or key == "version" or key == "modify_time":
                    continue
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"

if permitAllocationFlag == 1:
    if permitAllocation.count() == 0 :
        print "\n该用户所在公司的权限分配情况：无"
    else :
        print "\n该用户所在公司的权限分配情况："
        for data in permitAllocation:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did":
                    continue
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"








