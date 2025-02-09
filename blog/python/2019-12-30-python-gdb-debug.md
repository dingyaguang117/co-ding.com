---
layout: doc
title: "Python Debug with GDB"
date: 2019-12-30 15:04:02 +0800
category: "Python"
---

为什么需要使用 GDB 来调试程序？

1. 线上问题排查，需要 Attach 到运行中的程序
2. 排查死锁问题

主要是用到了 GDB 可以附加到运行中的程序这个特性。

Mac 缺少相关的组件， 所以我使用 Ubuntu 环境来调试 Python 程序。

1.  安装 gdb 的 Python 拓展

```bash
apt-get install python3.7-dbg
```

注意！设置权限:

设置 /proc/sys/kernel/yama/ptrace_scope 内容为 0

```bash
echo 0 |sudo tee /proc/sys/kernel/yama/ptrace_scope
```

如果在 docker 中调试，请在运行时加 --privileged 参数

```bash
docker run --privileged -d -ti <image> bash
docker exec --privileged -ti <container> bash
```

2. 运行 gdb， 有两种方式

a) 使用 gdb 启动程序

```bash
# 交互式
$ gdb python
(gdb) run <programname>.py <arguments>

# 自动式
gdb -ex r --args python <programname>.py <arguments>
```

b) 将 gdb attach 到正在运行的 Python 程序

```bash
gdb python <pid of running process>
```

attach 成功会暂停称在运行的程序，使用 c 命令继续

3. 调试程序

   Gdb 的命令非常丰富：可以加断点、打印栈、watch 变量、单步等等。可以参考 [gdb 调试命令](https://www.cnblogs.com/wuyuegb2312/archive/2013/03/29/2987025.html)

   这里主要介绍一下如何用 gdb 排查阻塞问题：阻塞的时候可以调用 `py-list` 或者 `py-bt` 查看当前代码阻塞的地方。一般是某个阻塞的系统调用，或者是等待获取某个锁。

参考文档：

1. [Debugging with GDB] (https://wiki.python.org/moin/DebuggingWithGdb)
2. [gdb 调试命令](https://www.cnblogs.com/wuyuegb2312/archive/2013/03/29/2987025.html)
