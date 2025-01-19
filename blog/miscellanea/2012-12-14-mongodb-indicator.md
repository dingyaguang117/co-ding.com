---
layout: doc
title: "mongodb 的数组定位器$"
date: 2012-12-14 15:04:02 +0800
---

先看一下下面这个文档:

```json
{
  "list": [
    { "id": 1, "name": "a" },
    { "id": 2, "name": "b" }
  ]
}
```

如何删除 list 中 id 为 2 的子 doc 呢？

我们知道 mongodb 提供了一个数据修改器

不过在文档上只有修改:

update({"list.id": 2}, {$set: {"list.$.name": "c"}})

删除呢？发现有

`update({"list.id": 2},{"$pop":{"list":1}})`

`update({"list.id": 2},{"$pull":{"list":xxx}})`

这两种删除方法，

第二种是根据内容(全匹配)的，所以考虑下第一种根据下标的，

尝试使用 `update({"list.id": 2},{"$pop":{"list":"$"}})`

success！
