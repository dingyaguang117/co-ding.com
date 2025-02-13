---
layout: doc
title: "使用 asyncio 100行代码实现https代理"
date: 2020-01-01 00:00:00 +0800
category: "Python"
---

今天学习了下 asyncio， 准备写段代码练练，想起 6 年前有写过一个多线程版本 HTTPS 代理，于是花了一下午时间使用 asyncio 重写一下。

HTTPS 代理，原理这里就不赘述了，可以参考 [Python 实现的 HTTP(s) 代理服务器](2014-01-25-Python-Http-Proxy)

先简述一下当年的版本的实现逻辑：

1. 为了简化 HTTP 头的解析，使用了 Python 标准库 BaseHTTPServer 起一个 HTTPServer
2. 每当一个请求进来的时候，BaseHTTPServer 库会帮我们解析好请求，并调用对应的 do_GET/do_POST/.. 方法
3. 通过使用解析的请求数据(host, method, headers, body)，使用 urllib2 请求远程服务
4. 将结果写回给客户端

> 对于 HTTPS 请求，第一个请求的 METHOD 是 CONNECT, 只需要建立双向转发的通道即可。

因为想直接使用 asyncio 撸，再使用异步 http 框架就不太好了，所以准备直接是用 asyncio 提供的异步 socket。

asyncio 版本基本思路如下：

1. 使用 asyncio.start_server 起一个 tcp server
2. 每当有请求进来的时候解析 HTTP 请求头，并记录下原始请求数据
3. 根据请求头里面的 host 和 port 建立 TCP 连接，并把原始请求数据发送到远程服务器
4. 直接双向转发客户端和服务器的请求和响应数据

这里需要使用到下面两个函数：

1. 建立 tcp server 函数

   > asyncio.start_server(callback, host, port, ...)

   start_server 开启一个 tcp server 监听 host:post， 当有 tcp 连接建立的时候，调用 callback 并传入两个参数 `reader: asyncio.StreamReader` 和 `writer: asyncio.SteramWriter` 从类型就可以看出这是两个异步的 IO 对象，它们提供同步读和写数据的方法。

2. 创建 tcp 连接函数

   > asyncio.open_connection(host, port)

   open_connection 建立成功时会返回 `asyncio.StreamReader` 和 `asyncio.SteramWriter` 对象

精简版的代码如下，去掉了各种异常处理和关闭处理:

```python
class ProxyServer(object):
    # 启动服务
    async def serve_forever(self, host, port):
        server = await asyncio.start_server(self.client_connected, host, port)
        await server.serve_forever()

    # 客户端请求进来
    async def client_connected(self, reader, writer):
        # 解析HTTP头
        data, headers = await self.parse_header(reader)
        # 连接远程服务器
        remote_reader, remote_writer = await self.create_connection(headers['_host'], headers['_port'])

        # 如果是HTTPS请求，根据rfc定义 代理需要给客户端返回一个 200
        if headers['_method'] == b'CONNECT':
            writer.write(b'HTTP/1.1 200 OK\r\n\r\n')
        else:
            remote_writer.write(data)

        # 建立双向转发
        asyncio.get_event_loop().create_task(self.transport(headers[b'Host'] + b' request', reader, remote_writer))
        asyncio.get_event_loop().create_task(self.transport(headers[b'Host'] + b' response', remote_reader, writer))

    # 连接远程服务器
    async def create_connection(self, host, port):
        reader, writer = await asyncio.open_connection(host, port)
        return reader, writer
```

完整代码请参考 [asyncio-proxy](https://github.com/dingyaguang117/asyncio-proxy)
