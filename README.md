# ProblemLocation

该项目是对平时客户反馈的问题进行定位排查

##  效果展示
![image](https://github.com/tunsuy/ProblemLocation/blob/promise/%E6%95%88%E6%9E%9C%E5%9B%BE/%E6%95%88%E6%9E%9C1.jpg)
![image](https://github.com/tunsuy/ProblemLocation/blob/promise/%E6%95%88%E6%9E%9C%E5%9B%BE/%E6%95%88%E6%9E%9C2.jpg)

##  技术选型
考虑到易用性和可操作性，决定做成web形式的，任何人都可以很方便的访问到该系统。  
最终做到界面直观简洁、操作简单方便、即使不熟悉我们应用的也能很快上手。

## 具体技术实现
nodejs-express框架作为整个后端框架  
bootstrap作为UI布局  
ejs最为前端框架  
Python为实现服务器端程序脚本  
Html、css等前端技术

## 扩展性
该系统在设计的时候就考虑了后续的扩展问题，所有扩展性很好。  
体现在：界面模块布局采用了配置文件的形式，所有增加或者减少一个模块时，只需修改下配置文件，界面代码基本改动很小。只需专注于逻辑开发就可以了。  
该系统后续会不断完善，把一些常见的功能集成在上面，方便测试或者开发自己查看相关信息、排查一些问题

