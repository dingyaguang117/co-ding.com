---
layout: doc
title: "使用 line_profiler 进行性能分析优化"
date: 2020-9-25 15:04:02 +0800
category: "随手记"
---

1. 安装 line_profiler：

```bash
pip install line_profiler
```

2. 修改代码

在需要逐行显示运行时间的函数/方法上面增加 @profile 装饰器

```python
#!/usr/bin/python
#coding=utf-8

@profile
def line_test():
   l1 = [0] * 1000000
   l2 = [0] * 10000000
   l3 = [0] * 100000000

if __name__ == "__main__":
      line_test()

```

`line_profiler` 会将 profile 装饰器注入到 `__builtins__` 命名空间中。

3. 运行测试

```bash
kernprof -l -v line_test.py
```
