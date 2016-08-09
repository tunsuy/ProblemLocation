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

if len(sys.argv) != 7 :
    print "use: " + sys.argv[0] + "did pid loginWebFlag jsLogTime jsLogNum phpLogNum"
    sys.exit(1)

did = string.atoi(sys.argv[1])
pid = string.atoi(sys.argv[2])
loginWebFlag = string.atoi(sys.argv[3])
jsLogTime = sys.argv[4]
jsLogNum = string.atoi(sys.argv[5])
phpLogNum = string.atoi(sys.argv[6])

jsLogDirPath = "/home/moa/log/weblog"
phpLogPath = "/usr/local/moa/php/var/log/php-fpm.log"

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
authinfosTable = mongoConn.webapp.authinfos
sessionTable = mongoConn.webapp.session

authinfos = authinfosTable.find({"did":did,"pid":pid}).sort([("time", pymongo.DESCENDING)]).limit(1)

# if loginWebFlag == 0 and phpLogNum == 0 :
#     print "您没有选择任何查询条件！！！"
#     sys.exit(0)

if loginWebFlag == 1:
    if authinfos.count() == 0 :
        print "该用户当前没有登录网页版"
    else :
        print "该用户当前登录网页版的相关信息如下："
        for data in authinfos:
            printStr = ""
            for key in data.keys():
                if key == "last_session_id":
                    sessionId = str(data[key])
                    sessionInfo = sessionTable.find({"sess_id":sessionId})
                    for sessionData in sessionInfo:
                        for sessionKey in sessionData.keys():
                            if key == "_id":
                                continue
                            else:
                                printStr += str(sessionKey)+": "+str(sessionData[sessionKey])+"; "
                        print printStr
                        print "-----------------------------------------"
                    break

def lastline():  
    global pos  
      
    while True:  
        pos = pos - 1  
        try: 
            # print pos 
            file_object.seek(pos, 2)  #从文件末尾开始读  
            if file_object.read(1) == "\n":  
                break  
        except:     #到达文件第一行，直接读取，退出  
            file_object.seek(0, 0)          
            print file_object.readline() 
            return  
     
    # print file_object.readline().strip() 

if jsLogTime != "0":
    print ("\n%s 当天 JS的日志如下: 默认 %s 条—可配置" % (str(jsLogTime),str(jsLogNum)))
    jslogPath = "%s/%s.log" % (str(jsLogDirPath),str(jsLogTime))
    if os.path.exists(jslogPath):
        file_object = open(jslogPath,"rb") 
        try:
            pos = 0     
            for line in range(jsLogNum+1):#需要倒数多少行就循环多少次  
                lastline()     
            for line in range(jsLogNum+1):
                # print "-----------------------------------------"
                print file_object.readline()

        finally:
             file_object.close()

if phpLogNum > 0:
    print ("\nPHP最新的日志如下: 默认 %s 条—可配置" % phpLogNum)
    if os.path.exists(phpLogPath):
        file_object = open(phpLogPath,"rb")
        try:
            pos = 0     
            for line in range(phpLogNum+1):#需要倒数多少行就循环多少次  
                lastline()
            for line in range(phpLogNum+1):
                # print "-----------------------------------------"
                print file_object.readline()     
                    
        finally:
             file_object.close()










