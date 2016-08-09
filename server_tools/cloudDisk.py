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

if len(sys.argv) != 3 :
    print "use: " + sys.argv[0] + " did fileName"
    sys.exit(1)

did = string.atoi(sys.argv[1])
fileName = sys.argv[2]

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
infoTable = mongoConn.clouddisk.info

infos = infoTable.find({"did":did,"name":fileName})

if fileName :
    if infos.count() == 0 :
        print "该公司不存在这样的文件"
    else :
        print "该文件信息为："
        for data in infos:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did" or key == "uid" or key == "sortid":
                    continue
                else:
                    if key == "create_time" or key == "modify_time":
                        tmptimeStr = time.localtime(float(str(data[key])[0:10]))
                        timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                        printStr += str(key)+": "+str(timeStr)+";  "
                    else:
                        printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"
else :
    print "您没有选择任何查询条件！！！"
    sys.exit(0)



