---
layout: doc
title: "Python 实现的 HTTP(s) 代理服务器"
date: 2014-01-25 15:04:02 +0800
---

前言:翻墙的工具大家用的最多的就是 GoAgent 和 VPN 了，其中 GoAgent 的原理是在本地搭一个 HTTP(s)代理服务器，浏览器上做好代理配置，然后本地代理再将浏览器的请求转发到墙外的服务器，再由远程服务器请求数据。
普通的 Http 代理就是浏览器将请求发给代理服务器，然后代理服务器访问数据，返回给浏览器。整个过程比 GoAgent 要少一个环节。至于为什么 GoAgent 这样设计，而不是直接在墙外搭建一个代理，我个人认为是这样可以在本地代理与墙外服务器通信时对数据进行加密，让 GFW 通过单一的包嗅探难以解密内容，让普通的 HTTP 连接也安全一点。
本文要讨论的是如何实现标准的 Http(s)代理服务器，对于 GoAgent 的方式不做细致分析，那天等我看完源码再来写写心得。

一、 HTTP 代理服务器原理
浏览器对于设置了代理的情况，第一行的 request line 会发生如下变化：

```bash
#未设置代理
GET /index.php HTTP/1.1
#设置了代理
GET http://www.domain.com/index.php HTTP/1.1
```

变化不算太大，下面的头信息和 body 部分格式都不会变。第一行变化的原因，我想，是让代理服务器可以读到第一行就就可以确定 remote host 的地址了，然后就可以进行转发了。从而减少计算开支。

二、HTTP 代理服务器现实思路

看到这里，我们就可以思考怎么实现代理服务器了：这里我们需要接收到请求，然后解析 remote host，然后再将请求原样发送到 remote host，再将得到的结果原样返回给 client。
对于编写代理服务器的人来说，这还是标准的 HTTP 请求，所以可以偷懒用 BaseHTTPServer 模块搭建代理服务器。至于代理服务器请求数据部分，可以选择：

1. 使用基础 socket 通信，原样转发，效率高。

2. 使用 httplib 或者 urllib，可以方便的抽取通讯数据，便于监视通讯过程，因为有了解析的步骤，效率较低。

由于我有监控通信的需求，所以使用了 urllib2，于是最简单的代理过程就是这样的：

```python
#coding=utf-8
__author__ = 'ding'
import sys
import BaseHTTPServer
import urllib2
from urllib2 import HTTPError
import threading
from SocketServer import ThreadingMixIn
import socket

class RedirectHandler(urllib2.HTTPRedirectHandler):
    def http_error_301(self, req, fp, code, msg, headers):
        pass
    def http_error_302(self, req, fp, code, msg, headers):
        pass
    def http_error_303(self, req, fp, code, msg, headers):
        pass
    def http_error_307(self, req, fp, code, msg, headers):
        pass
urllib2.install_opener(urllib2.build_opener(RedirectHandler))

class Handle(BaseHTTPServer.BaseHTTPRequestHandler):
    def __write_response(self,ret):
        #完成代理任务，数据写回
        self.send_response(ret.getcode())
        for key in ret.headers.keys():
            self.send_header(key,ret.headers[key])
        self.end_headers()
        BUFFER_SIZE = 1024
        data = ret.read(BUFFER_SIZE)
        #处理 chunked 传输编码,下面的写法在gzip等压缩的情况下有bug
        if ret.headers.get('transfer-encoding','') == 'chunked':
            while data:
                size = len(data)
                self.wfile.write('%s\r\n'%hex(size).upper()[2:])
                self.wfile.write(data)
                self.wfile.write('\r\n')
                data = ret.read(BUFFER_SIZE)
            self.wfile.write('0\r\n\r\n')
        else:
            while data:
                self.wfile.write(data)
                data = ret.read(BUFFER_SIZE)

    def do_GET(self):
        print 'raw requestline:',self.raw_requestline
        try:
            req = urllib2.Request(self.path,headers=self.headers)
            ret = urllib2.urlopen(req)
        except HTTPError,e:
            ret = e
        self.__write_response(ret)

    def do_POST(self):
        content_length = int(self.headers['content-length'])
        data = self.rfile.read(content_length)
        try:
            req = urllib2.Request(self.path,data,headers=self.headers)
            ret = urllib2.urlopen(req)
        except HTTPError,e:
            ret = e
        self.__write_response(ret)

class ThreadHttpServer(ThreadingMixIn,BaseHTTPServer.HTTPServer):
    pass

def main():
    server = ThreadHttpServer(('',9876),Handle)
    server.serve_forever()

if __name__ == '__main__':
    main()
```

因为使用了 urllib2，所以方便的同时也带来很多麻烦，比如自动处理 30x 跳转，和自动完成 body 部分的内容合并。因为是做代理服务器，需要严格返回一致的结果，所以需要手动阻止 30x 跳转，以及 chunked 编码。

关于 chunked 编码，其实是在 response header 里没有写明 content-length，而在 body 部分分多段，每段开头写明此段的长度，如果长度为 0，表示结束。至于这种编码方式出现的原因，是说可能会有返回长度不确定的情况，所以一开始写头的时候不知道。

三、HTTPS 代理服务器的原理

为了搞清楚 HTTPS 代理与直接连接有什么不同，我用 wireshark 抓了一下包，如下：

发现后面的和直接连接是一样的，hello 然后交换秘钥，前面发生了什么呢？friendly 的看一下：

看到了一个新的动作“CONNECT”，后面跟的是 host。然后代理返回一行 200。 后面的就和正常 HTTPS 的流程一样了。

所以我们添加 do_CONNECT, 完成回应的动作之后，就将 client 和 server 的数据相互转发一下：

```python
def do_CONNECT(self):

        self.send_response(200)
        self.end_headers()

        soc = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        host,port = self.path.split(':')
        port = int(port)
        soc.connect((host,port))
        soc_fd = soc.makefile('rw', 0)
        t1 = threading.Thread(target=self._https_forward, args=(self.connection, soc, 'browser -> server'))
        t2 = threading.Thread(target=self._https_forward, args=(soc, self.connection, 'server -> browser'))
        t1.start()
        t2.start()
        t1.join()
        t2.join()

    def _https_forward(self, soc1, soc2, description):
        print description, 'started!!'
        BUFFER_SIZE = 1024
        data = soc1.recv(BUFFER_SIZE)
        while data:
            soc2.sendall(data)
            data = soc1.recv(BUFFER_SIZE)
        print description, 'down!!'
```

好了，HTTPS 的代理就完成了。当然，这里传输的数据都是加密的，我们没有私钥，所以无法得知 AES 的秘钥是啥，所以内容也就当然无法得知了。 如果要做到监控 HTTPS 内容怎么办呢？需要 建立一个中间人，这已不在本文介绍范围内，有兴趣可以自己 Google “MITM”

[本文项目地址](https://github.com/dingyaguang117/PyHttpProxy)
