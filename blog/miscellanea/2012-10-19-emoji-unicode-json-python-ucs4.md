---
layout: doc
title: "emoji,unicode,json,python,ucs-4"
date: 2012-10-19 00:00:00 +0800
category: "杂项"
---

今天有一项工作是将微博文本中的表情 [大笑]之类的替换成 emoji 表情
于是在网上找到一个[emoji 表情的 unicode 对照表](http://web.archive.org/web/20161114023427/http://www.unicode.org/~scherer/emoji4unicode/snapshot/full.html)，发现很多 unicode 的表情是超过 2 字节的，因为 UCS2 规范只用 2 个字节进行映射对照，所以需要 UCS4 规范了。
那么怎么在 pyhton 中使用四字节的 unicode 字符呢？

先补充一下 unicode 的基本知识吧：

注意过"u1234"这种转义吗？其实这就是表示这个字符是编号为"0x1234"的 unicode 字符，注意与任何编码无关！因为 unicode 只是一种规范，仅仅是给了字符到 unicode 编号的映射关系而已。

例如：假如“丁”这个字在 unicode 中编号为 10000，这个 10000 就是“丁”的 unicode 序号。但是 10000 写在文件里面怎么写呢？必须得转换成二进制字符串吧？你是用几个字节表示呢？这才涉及到编码问题。

好了，python 中，直接在代码中怎么写 unicode 呢？只需要在字符串前面加 u 就好了，例如：

u"丁亚光" 这样解释器会根据文件头部设置的编码(就是#coding=utf-8 这一行，没有就是系统默认编码)给"丁亚光"在 py 文件中的二进制串进行 decode。

如果直接知道字符的 unicode 序号也可以，直接 u"u1234"就行了。但是这里我们需要的是 4 字节的,怎么写呢？要用 U 进行转义 u"U0001F604",后面是 hexlify 的 8 位串，其实是 4 个字节。

当然上面是直接在代码中写的硬代码，如果在文件中读取了"U0001F604",怎么办呢？回想 python 有 ord 和 chr 用来将字符变成 ascii 码，和将 ascii 码转成字符。python 提供了 unichr 完成这个工作~所以需要这么写:

```python
s = "0001F604"
ch = unichr(int(s,16))
```

很不幸，python 报错了：

`ValueError: unichr() arg not in range(0x10000) (narrow Python build)`

原来是 python 编译的时候没有选择 ucs-4 的支持,不能超过 0x10000 啊，怎么办？重新安装 python？太麻烦

想想代码中还是可以用硬编码来使用 ucs-4 的字符的，python 这种脚本语言肯定能用 eval 函数啦~~

```python
eval('u'\U001F604'')
```

恩恩 果然可以~~

好了这回可以把替换之后的文本发送给 ios 客户端啦~不过悲剧发生了~ios 客户端居然显示方块

三观顿时粉碎，难道对 emoji 的理解是错的吗？于是开始试验：

```python
s = {"name":u"U0001F494"}
#python里面的U表示4字节的unicode u表示2个字节
jsonStr = json.dumps(s)
#这时，jsonSTr的值为 {"name": "ud83dudc94"}
#我了解了一下，这个UCS4的字符，被UTF-16编码成"ud83dudc94"了
s = json.loads(jsonStr)
#这时s = {u'name': u'U0001f494'}，还原，完全没有问题
```

看了看，ud83dudc94 其实是 utf-16 的编码。查了下，如果不希望 json 把 no-ascii 的字符格式转换，只需要：

`jsonStr = json.dumps(s,ensure_ascii=False)`

看 python 正反解析都是没问题的，于是怀疑 ios 客户端要求的 emoji 格式是不是并不是 unicode 的？去前端围观了下怎么打 emoji，发现确实是只要是 unicode 的就行。难道是 ios 端 json 解析器有问题？于是让前端把 unicode 字符串用 sbjson 这个 Object-C 的 json 库 dumps 出来，发现是没有进行 no-ascii 转换的，直接就是 utf-8 编码的二进制串.猜想 sbjson 应该对"ud83dudc94"这种格式支持不太好，于是打出 sbjson 加载的"ud83dudc94"，发现只有三个字节，其实这个的 utf-8 是 4 个字节的。似乎确认了问题的原因，于是让前端换了 jsonkit 这个 Object-C 的 json 库，问题解决!

附一篇写的不错的 unicode 文章，不太清楚的可以参考下
[http://tech.idv2.com/2008/02/21/unicode-intro/](http://tech.idv2.com/2008/02/21/unicode-intro/)
