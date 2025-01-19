---
layout: doc
title: "Python3 新特性与升级事项"
date: 2019-12-12 15:04:02 +0800
outline: deep
---

## 一、Python3 新特性

### **1. typing**

> typing 模块并不会在运行时强制检查类型，不符合的类型也可以继续工作

示例

```python
from typing import Dict, List

def numbers(n: int) -> List[int]:
   return [1] * n
```

有啥用？

1. 于代码含义的解释和补充
2. 有助于 IDE 推导类型，完善自动补全 (比如：db.session)
3. 帮助代码检查工具检查代码

[typing 官方文档](https://docs.python.org/zh-cn/3/library/typing.html)

### **2.f-string**

引用上下文变量、函数，简化 format 写法

```python
>> name = "James"
>> def foo():
....    return 20
>> f"Hello, {name}, {foo()}!"'
"Hello, James, 20!"
```

### **3.dict 保证插入有序**

```python
>> {str(i):i for i in range(5)}
{'0': 0, '1': 1, '2': 2, '3': 3, '4': 4}
```

### **4.解包**

a) 列表解包

```python
>>a, b, *others = [1, 2, 3, 4]
a -> 1
b -> 2
others = [3, 4]
```

b) 字典解包

```python
>>x = dict(a=1, b=2)
>>y = dict(b=3, d=4)
# Python 3.5+
>>z = {**x, **y}
```

c）列表、元组、set 解包

```python
>>[*a, *b, *c]
>>(*a, *b, *c)
>>{*a, *b, *c}
```

### **5.更简单的 super**

```python
# Python 2
class MyClass(Base):
    def __init__():
        super(MyClass, self).__init__()

# Python 3
class MyClass(Base):
    def __init__(self:
        super().__init__()
```

### **6.原生的协程库 asyncio**

```python
import asyncio

# 3.5以前
@asyncio.coroutine
def py34_coro():
    yield from stuff()

# 3.5+ 支持 async 和 await 关键字
async def py35_coro():
    await stuff()
```

tornado 6.0 以后，默认的事件循环也使用的 asyncio. 并且支持原生的语法。

### **7. 更好用的路径库**

```python
from pathlib import Path
```

假设有 `filename = 'a/b/c/1.jpg'`

| 功能     | Python2                                          | Python3                            |
| -------- | ------------------------------------------------ | ---------------------------------- |
| 父目录   | os.path.dirname(os.path.dirname(filename))       | Path(filename).parent.parent       |
|          |                                                  | Path(filename).parents[1]          |
| 后缀     | os.path.basename(filename).split('.')[-1]        | Path(filename).suffix              |
| join     | os.path.join('/roo', filename)                   | Path('/root', filename)            |
|          |                                                  | Path('/root') / filename           |
| 换文件名 | os.path.join(os.path.dirname(filename), '2.jpg') | Path(filename)..with_name('2.jpg') |
| 换后缀   | filename.split('.', 2)[0] + '.png'               | Path(filename).with_suffix('.png') |

### **8. 新的标准库**

- asyncio（异步 IO）
- faulthandler
- ipaddress （IP 地址操作、计算）
- functools.lru_cache （LRU Cache 装饰器）
- enum （枚举类）
- pathlib (更便捷的 路径库)

### **9. 海象表达式 （Python3.8） :=**

赋值和使用放在一起

```python
if (n := len(a)) > 10:
    print(f"List is too long ({n} elements, expected <= 10)")
```

```python
while (block := f.read(256)) != '':
    process(block)
```

## 二、从 Python2 升级，我需要注意什么？

这本书全面详细的介绍了迁移到 Python3 所需要的知识：

[Supporting Python 3: An in-depth guide](http://python3porting.com/bookindex.html)

### **1. print 成为 函数**

在 Python3 中 print 是个函数，这意味着在使用的时候必须带上小括号,并且它是带有参数的。\*\*

```python
old: print "The answer is", 2+2
new: print("The answer is", 2+2)

old: print x,      # 末尾加上逗号阻止换行
new: print(x, end="") # 使用空格来代替新的一行

old: print >>sys.staerr, "fatal error"
new: print ("fatal error", file=sys.stderr)

old: print (x, y)   # 打印出元组(x, y)
new: print((x, y))  # 同上,在python3中print(x, y)的结果是跟这不同的
```

### **2. import 默认使用绝对路径**

Python3 中 import 使用相对路径，必须加 `.` ， 比如有下列目录

```bash
	a/
	  text.py
	  processor.py
```

从 processor.py 引用 text.py
py2 写法，支持这种写法和下面 py3 的写法

```python
from text import *
```

py3 写法，只支持这种写法

```python
from .text import *
```

### **3. 字符串**

字符串的变化可能是对 Python2 项目升级到 Python3 最大的挑战了，不仅是代码字面量默认类型的变化("a" 在 Python3 中是 Unicode 字符串，在 Python2 中是字节串)，关键词的含义也有相应的变化(str 在两个版本中代表的类型是不一样)。

下表总结一些变化

| No. |                         | Python2                                                          | Python3                                                       | 备注                                                                        |
| :-: | ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0.  | basestring              | str 和 unicode 的父类                                            | -                                                             |                                                                             |
| 1.  | str                     | 字节串                                                           | unicode 串                                                    |                                                                             |
| 2.  | unicode                 | unicode 串                                                       | -                                                             |                                                                             |
| 3.  | bytes                   | 字节串(str 别名)                                                 | 字节串                                                        |                                                                             |
| 4.  | b""                     | 字节串                                                           | 字节串                                                        |                                                                             |
| 5.  | ""                      | 字节串                                                           | unicode 串                                                    |                                                                             |
| 6.  | u""                     | unicode 串                                                       | unicode 串                                                    |                                                                             |
| 7.  | b"a" + u"b"             | u"ab"                                                            | 异常 （TypeError: can't concat str to bytes）                 |                                                                             |
| 8.  | u"{}".format(b"a")      | u"a"                                                             | u"b'a'"                                                       | format 千万不要类型混在一起                                                 |
| 9.  | b"{}".format(u"a")      | b"a"                                                             | 异常 （'bytes' object has no attribute 'format'）             |                                                                             |
| 10. | u"中文".decode('utf-8') | 异常 (UnicodeEncodeError: 'ascii' codec can't encode characters) | 异常 (AttributeError: 'str' object has no attribute 'decode') | Python2 会先尝试使用默认编码 encode 再 decode, Python3 直接没有 decode 方法 |

总结：

a. 如果是文本类型，尽量在输入输出的时候就进行 unicode 转换，避免 bytes 类型传递到业务逻辑中做类型检查。  
b. 升级 Python3 后检查代码中所有的 encode("utf-8") 和 decode("utf-8")， 90% 会出问题。  
c. 字符串拼接和 format，一定要注意上表格中 第 8 条

### **4. 标准库改名**

ConfigParser 等库被改名

httplib, BaseHTTPServer, CGIHTTPServer, SimpleHTTPServer, Cookie, cookielib 被合并到 http 包内。

StringIO 模块现在被合并到新的 io 模组内。

new, md5, gopherlib 等模块被删除

urllib 和 urllib2 合并

**不用担心 `2to3` 帮你搞定**

### **7. "一切"皆迭代类型**

range 函数、字典的 items/values/keys 方法、map 函数、filter 函数， 均返回迭代器类型；同时移除了显示的迭代器类型方法。

|     表达式      | Python2    | Python3         |
| :-------------: | ---------- | --------------- |
|     xrange      | 返回迭代器 | -（不存在）     |
|      range      | 返回列表   | 返回迭代器      |
|   {}.items()    | []         | dict_items([])  |
| {}.iteritems()  | iterator   | - (不存在)      |
|    {}.keys()    | []         | dict_keys([])   |
|  {}.iterkeys()  | iterator   | - (不存在)      |
|   {}.values()   | []         | dict_values([]) |
| {}.itervalues() | iterator   | - (不存在)      |
|                 |            |                 |

### **8. 类型比较更严格**

以下在 Python2 中合法，但是在 Python3 中不合法

| 非法表达式          | 备注                                              |
| ------------------- | ------------------------------------------------- |
| 3 < '3'             | 数字与字符串不能比较                              |
| 2 < None            | None 不能与任何类型进行大小比较，但是可以 == 比较 |
| (3, 4) < (3, None)  | 包含 None                                         |
| (4, 5) < [4, 5]     | 元组和 list 不能比较                              |
| sorted([2, '1', 3]) | 不同类型不能比较大小，所以也不能排序              |
| max(1, None)        | 同上                                              |
| min(1, None)        | 同上                                              |

### **9.只支持 Exception as**

```python
# Python2 中可以使用下面两种方法捕捉异常
try:
    do_something()
except Exception, e:
    print e

# Python3 支持 as

try:
    do_something()
except Exception as e:
    print e
```

### **10. 整型数**

- long 重命名了 int,因为在内置只有一个名为 int 的整型,但它基本跟之前的 long 一样。

- 像 1/2 这样的语句将返回 float，即 0.5。使用 1//2 来获取整型,这也是之前版本所谓的“地板除”。

- 移除了 sys.maxint,因为整型数已经没了限制。sys.maxsize 可以用来当做一个比任何列表和字符串下标都要大的整型数。

- repr()中比较大的整型数将不再带有 L 后缀。

- 八进制数的字面量使用 0o720 代替了 0720。

- round(1, 2) 返回整型， 在 Python2 中 round 总是返回 float 类型

### **11. 不等于表达式**

Python 2.x 中不等于有两种写法 != 和 <>

Python 3.x 中去掉了 <>，只有 != 一种写法。

### **12.打开文件**

原先有两种打开方式：

```python
file( ..... )
```

```python
open(.....)
```

现在改成只能用

```python
open(......)
```

### **13. 从 stdin 输入**

以前

```python
raw_input("提示信息")
```

现在

```python
input("提示信息")
```

在 python2.x 中 raw_input() 和 input( )，两个函数都存在，其中区别为：

- raw_input()：将所有输入作为字符串看待，返回字符串类型
- input()：只能接收"数字"的输入，在对待纯数字输入时具有自己的特性，它返回所输入的数字的类型（int, float ）

在 python3.x 中 raw_input() 和 input( ) 进行了整合，去除了 raw_input()，仅保留了 input() 函数，其接收任意任性输入，将所有输入默认为字符串处理，并返回字符串类型。

### **14.对只读属性赋值**

下面这段代码在 Python3 下会报错

```python
class A:
    @property
    def is_whitelist_only(self):
        return True

a = A()
a.is_whitelist_only = False
```

### **补充**

上面的总结并不全面，强烈建议看一下： 2to3 工具 [修改的范围](https://docs.python.org/3.6/library/2to3.html#fixers)，
