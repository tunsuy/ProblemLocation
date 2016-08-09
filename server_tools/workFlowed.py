#encoding: utf-8
import MySQLdb
import sys
import os
import string

reload(sys)
sys.setdefaultencoding("utf-8")

if len(sys.argv) < 9 :
    print "use: " + sys.argv[0] + " userAccount password pid applyingNum rejectedNum handlingNum handledNum copymeNum [hostIP]"
    sys.exit(1)

userAccount = sys.argv[1]
password = sys.argv[2]
pid = string.atoi(sys.argv[3])
applyingNum = string.atoi(sys.argv[4])
rejectedNum = string.atoi(sys.argv[5])
handlingNum = string.atoi(sys.argv[6])
handledNum = string.atoi(sys.argv[7])
copymeNum = string.atoi(sys.argv[8])

if len(sys.argv) == 9:
    hostIP = "localhost"

if len(sys.argv) == 10:
    hostIP = sys.argv[9]

if applyingNum == 0 and rejectedNum == 0 and handlingNum == 0 and handledNum == 0 and copymeNum == 0:
    print "您没有选择任何查询条件！！！"
    sys.exit(0)

try:
    conn=MySQLdb.connect(host=hostIP,user=userAccount,passwd=password,port=3306)
    cur=conn.cursor()
     
    conn.select_db("WFS_1")
    
    if applyingNum >0:
        sqlStr = "select *from FLOW_PROCESSINST_RELA where STARTUSERID =  %s  and PROCESS_STATE = 1 order by SUBMITTIME desc" % str(pid)
        cur.execute(sqlStr)
        datas=cur.fetchmany(applyingNum)
        if len(datas) > 0:
            print ("正在申请中的流程有: 默认 %s 条——可配置" % str(applyingNum))
            for data in datas:
                print "流程类型："+data[12]+"，申请理由："+data[5]+", 申请时间："+data[13].strftime("%Y-%m-%d %H:%M:%S")
                print "-----------------------------------------"
        else:
            print "正在申请中的流程有：无"
        
    if rejectedNum > 0:
        sqlStr = "select *from FLOW_PROCESSINST_RELA where STARTUSERID =  %s  and PROCESS_STATE = 0" % str(pid)
        cur.execute(sqlStr) 
        datas=cur.fetchmany(rejectedNum)
        if len(datas) > 0:
            print ("\n被拒绝的流程有：默认 %s 条——可配置" % str(rejectedNum))
            for data in datas:
                print "流程类型："+data[12]+"，当前处理人："+data[8]+"，最后处理时间："+data[10].strftime("%Y-%m-%d %H:%M:%S") 
                print "-----------------------------------------"
        else:
            print "\n被拒绝的流程有：无"
        
    if handlingNum > 0:
        sqlStr = "select *from FLOW_TODOTASK_V where ASSIGNEE_ = %s" % str(pid)
        cur.execute(sqlStr) 
        datas=cur.fetchmany(handlingNum)
        if len(datas) > 0:
            print ("\n需要我审批的流程有：默认 %s 条——可配置" % str(handlingNum))
            for data in datas:
                print "TASKNAME："+data[2]+"，TASKCREATETIME："+data[5].strftime("%Y-%m-%d %H:%M:%S")+"，INFO_："+data[11]+"，PROCESSLASTUPDATE: "+data[15].strftime("%Y-%m-%d %H:%M:%S")
                print "-----------------------------------------"
        else:
            print "\n需要我审批的流程有：无"          

    if handledNum > 0:
        sqlStr = "select *from FLOW_TASK_V where ASSIGNEE_ = %s order by PROCESSENDTIME desc" % str(pid)
        cur.execute(sqlStr) 
        datas=cur.fetchmany(handlingNum)
        if len(datas) > 0:
            print ("\n我审批过的流程有：默认 %s 条——可配置" % str(handledNum))
            for data in datas:
                print "TASKNAME："+data[2]+"，TASKCREATETIME："+data[5].strftime("%Y-%m-%d %H:%M:%S")+"，TASKENDTIME: "+data[9].strftime("%Y-%m-%d %H:%M:%S")+"，INFO_："+data[12]+"，PROCESSLASTUPDATE: "+data[16].strftime("%Y-%m-%d %H:%M:%S")
                print "-----------------------------------------"
        else:
            print "\n我审批过的流程有：无"
        
    if copymeNum > 0:
        sqlStr = "select *from FLOW_READTASK_V where ASSIGNEE_ = %s" % str(pid)
        cur.execute(sqlStr) 
        datas=cur.fetchmany(handlingNum)
        if len(datas) > 0:
            print ("\n抄送给我的流程有：默认 %s 条——可配置" % str(copymeNum))
            for data in datas:
                print "PROCESSSTARTTIME："+data[1].strftime("%Y-%m-%d %H:%M:%S")+"，TASKNAME："+data[2]+"，TASKCREATETIME："+data[5].strftime("%Y-%m-%d %H:%M:%S")+"，PROCESSENDTIME: "+data[8].strftime("%Y-%m-%d %H:%M:%S")+"，INFO_："+data[11]+"，PROCESSLASTUPDATE: "+data[15].strftime("%Y-%m-%d %H:%M:%S")
                print "-----------------------------------------"
        else:
            print "\n抄送给我的流程有：无"      
    
    # conn.commit()
    cur.close()
    conn.close()
 
except MySQLdb.Error,e:
     print "\nMysql Error %d: %s" % (e.args[0], e.args[1])