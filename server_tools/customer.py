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
    print "use: " + sys.argv[0] + " did customerName attributeFlag labelFlag exportFlag"
    sys.exit(1)

did = string.atoi(sys.argv[1])
customerName = sys.argv[2]
attributeFlag = string.atoi(sys.argv[3])
labelFlag = string.atoi(sys.argv[4])
exportFlag = string.atoi(sys.argv[5])

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
infoTable = mongoConn.customer.info
attributeTable = mongoConn.customer.attribute
labelTable = mongoConn.customer.label
exportTable = mongoConn.customer.nillable

customerInfo = infoTable.find({"did":did,"name":customerName})
attributeOn = attributeTable.find({"did":did,"attrs.off_on":{"$nin":[0]}})
attributeOff = attributeTable.find({"did":did,"attrs.off_on":{"$nin":[1]}})
label = labelTable.find({"did":did})
export = exportTable.find({"did":did})

if customerInfo.count() == 0:
    print "该公司不存在这样的客户"
else:
    print "该客户信息为："
    for data in customerInfo:
        printStr = ""
        for key in data.keys():
            if key == "_id" or key == "did" or key == "custmid" or key == "version":
                continue
            else:
                if key == "create_time" or key == "modify_time":
                    tmptimeStr = time.localtime(float(str(data[key])[0:10]))
                    timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                    printStr += str(key)+": "+str(timeStr)+";  "
                elif key == "post":
                    postStr = "["
                    for postKey in data[key].keys():
                        postStr += str(postKey)+":"+str(data[key][postKey])+"; "
                    printStr += str(key)+": "+str(postStr) + "];  "
                elif key == "followers":
                    followersStr = "{"
                    for followerData in data[key]:
                        followerDataStr = "["
                        for followerDataKey in followerData.keys():
                            if followerDataKey == "start_time":
                                tmptimeStr = time.localtime(float(str(followerData[followerDataKey])[0:10]))
                                timeStr = time.strftime("%Y-%m-%d %H:%M:%S",tmptimeStr)
                                followerDataStr += str(followerDataKey)+": "+str(timeStr)+", "
                            else:
                                followerDataStr += str(followerDataKey)+": "+str(followerData[followerDataKey])+", "
                        followersStr += followerDataStr + "]; "
                    printStr += str(key)+": "+str(followersStr)+"};  "
                elif key == "lbl_doc":
                    lblDocStr = "{"
                    for lblDocKey in data[key].keys():
                        if lblDocKey == "clbls":
                            clblsStr = "["
                            for clblData in data[key][lblDocKey]:
                                clblDataStr = "{"
                                for clblDataKey in clblData.keys():
                                    if clblDataKey == "lbl":
                                        clblDataLblStr = "["
                                        for clblDataLblKey in clblData[clblDataKey].keys():
                                            clblDataLblStr += str(clblDataLblKey)+": "+str(clblData[clblDataKey][clblDataLblKey])+", "
                                        clblDataStr += str(clblDataKey)+": "+str(clblDataLblStr)+"], "
                                    elif clblDataKey == "sub_lbls":
                                        for subLblData in clblData[clblDataKey]:
                                            subLblDataStr = "{"
                                            for subLblDataKey in subLblData.keys():
                                                if subLblDataKey == "lbl":
                                                    subLblDataLblStr = "["
                                                    for subLblDataLblKey in subLblData[subLblDataKey].keys():
                                                        subLblDataLblStr += str(subLblDataLblKey)+": "+str(subLblData[subLblDataKey][subLblDataLblKey])+", "
                                                    subLblDataStr += str(subLblDataKey)+": "+str(subLblDataLblStr)+"], "
                                                else:
                                                    subLblDataStr += str(subLblDataKey)+": "+str(subLblData[subLblDataKey])+"; "
                                        clblDataStr += str(clblDataKey)+": "+str(subLblDataStr)+"}, "
                                    else:
                                        clblDataStr += str(clblDataKey)+": "+str(clblData[clblDataKey])+", "
                                clblsStr += str(clblDataStr)+"}; "
                            lblDocStr += str(lblDocKey)+": "+clblsStr+"], "
                        else:
                            lblDocStr += str(lblDocKey)+": "+str(data[key][lblDocKey])+", "
                    printStr += str(key)+": "+str(lblDocStr)+"};  "
                elif key == "contacts":
                    contactStr = "["
                    for contactData in data[key]:
                        contactDataStr = "{"
                        for contactDataKey in contactData.keys():
                            contactDataStr += str(contactDataKey)+": "+str(contactData[contactDataKey])+", "
                        contactStr += contactDataStr + "}; "
                    printStr += str(key)+": "+str(contactStr)+"];  "
                else:
                    printStr += str(key)+": "+str(data[key])+";  "
        print printStr
        print "-----------------------------------------"

if attributeFlag == 0 and labelFlag == 0 :
    print "\n您没有选择任何查询条件！！！"
    sys.exit(0)

if attributeFlag == 1:
    if attributeOff.count() == 0 :
        print "\n该用户所在公司关闭的客户属性：无"
    else :
        print "\n该用户所在公司关闭的客户属性："
        for data in attributeOff:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did":
                    continue
                elif key == "attrs" or key == "user_attrs":
                    attrStr = "["
                    for attrData in data[key]:
                        for attrKey in attrData.keys():
                            attrStr += str(attrKey)+":"+str(attrData[attrKey])+","
                    printStr += str(key)+": "+str(attrStr)+"]; "
                            
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"
    if attributeOn.count() == 0 :
        print "\n该用户所在公司开启的客户属性：无"
    else :
        print "\n该用户所在公司开启的客户属性："
        for data in attributeOn:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did":
                    continue
                elif key == "attrs" or key == "user_attrs":
                    attrStr = "["
                    for attrData in data[key]:
                        attrDataStr = "{"
                        for attrKey in attrData.keys():
                            attrDataStr += str(attrKey)+":"+str(attrData[attrKey])+","
                        attrStr += attrDataStr + "}; "
                    printStr += str(key)+": "+str(attrStr)+"];  "
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"

if labelFlag == 1:
    if label.count() == 0 :
        print "\n该用户所在公司的客户标签：无"
    else :
        print "\n该用户所在公司的客户标签："
        for data in label:
            printStr = ""
            for key in data.keys():
                if key == "_id" or key == "did" :
                    continue
                elif key == "clbls":
                    clblsStr = "["
                    for clblData in data[key]:
                        clblDataStr = "{"
                        for clblDataKey in clblData.keys():
                            if clblDataKey == "lbl":
                                clblDataLblStr = "["
                                for clblDataLblKey in clblData[clblDataKey].keys():
                                    clblDataLblStr += str(clblDataLblKey)+": "+str(clblData[clblDataKey][clblDataLblKey])+", "
                                clblDataStr += str(clblDataKey)+": "+str(clblDataLblStr)+"], "
                            elif clblDataKey == "sub_lbls":
                                for subLblData in clblData[clblDataKey]:
                                    subLblDataStr = "{"
                                    for subLblDataKey in subLblData.keys():
                                        if subLblDataKey == "lbl":
                                            subLblDataLblStr = "["
                                            for subLblDataLblKey in subLblData[subLblDataKey].keys():
                                                subLblDataLblStr += str(subLblDataLblKey)+": "+str(subLblData[subLblDataKey][subLblDataLblKey])+", "
                                            subLblDataStr += str(subLblDataKey)+": "+str(subLblDataLblStr)+"], "
                                        else:
                                            subLblDataStr += str(subLblDataKey)+": "+str(subLblData[subLblDataKey])+"; "
                                clblDataStr += str(clblDataKey)+": "+str(subLblDataStr)+"}, "
                            else:
                                clblDataStr += str(clblDataKey)+": "+str(clblData[clblDataKey])+", "
                        clblsStr += str(clblDataStr)+"}; "
                    printStr += str(key)+": "+clblsStr+"], "
                
                else:
                    printStr += str(key)+": "+str(data[key])+";  " 

            print printStr
            print "-----------------------------------------"

if exportFlag == 1:
    if export.count() == 0 :
        print "\n该用户所在公司没有开启过客户导出权限"
    else :
        print "\n该用户所在公司客户导出权限情况："
        for data in export:
            printStr = ""
            exportValue = 0
            for key in data.keys():
                if key == "_id" or key == "did" or key == "version":
                    continue
                else:
                    printStr += str(key)+": "+str(data[key])+", "
                    if key == "allow_export" and data[key] == 1:
                        exportValue = 1
            print printStr
            if exportValue == 1:
                print "\n该用户所在公司开启了客户导出权限"
            else:
                print "\n该用户所在公司没有开启客户导出权限"
            print "-----------------------------------------"








