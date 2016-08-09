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

if len(sys.argv) != 3 :
    print "use: " + sys.argv[0] + " did formModelFlag"
    sys.exit(1)

did = string.atoi(sys.argv[1])
formModelFlag = string.atoi(sys.argv[2])

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
formModelTable = mongoConn.workreport.form_model
formModel = formModelTable.find({"did":did})

if formModelFlag == 0:
    print "您没有选择任何查询条件！！！"
    sys.exit(0)

if formModelFlag == 1:
    if formModel.count() == 0 :
        print "该公司的工作汇报模板：无"
    else :
        print "该公司的工作汇报模板："
        for data in formModel:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did" :
                    continue
                elif key == "form_model_contents":
                    formContentStr = "["
                    for formContentData in data[key]:
                        # print formContentData
                        # formContentDataStr = "{"
                        # for formContentKey in formContentData.keys():
                        #     formContentDataStr += str(formContentKey)+": "+str(formContentData[formContentKey])+", "
                        # formContentStr += formContentDataStr + "};  "
                        formContentStr += formContentData + ", "
                    printStr += str(key)+": "+formContentStr+"];  "
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"








