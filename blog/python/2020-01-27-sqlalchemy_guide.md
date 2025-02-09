---
layout: doc
title: "SQLAlchemy 使用简略"
date: 2020-01-27 00:00:00 +0800
category: "Python"
---

## 一、查询：

1. **Query 对象**

   使用 `db.session.query(Model)` 或者 `Model.query` 可以获得 [Query 对象](https://docs.sqlalchemy.org/en/13/orm/query.html?highlight=one#the-query-object).

   其中后者是 torn 对 Model 的增强，不属于 sqlalchemy 的原生功能.

   Query 可以使用 `filter` 和 `filter_by` 方法添加查询条件，两个方法均返回 Query 对象，因此可以链式调用

   ```python
   query = db.session.query(User).filter(User.id == 1).filter_by(name=1)
   ```

   两个方法的区别是：

   a. `filter` 方法接受的是 `*args`： 类型为 `参数表达式对象`

   举例：

   ```python
   db.session.query(User).filter(User.id==1)
   db.session.query(User).filter(User.id!=1, User.name=='ding'')
   db.session.query(User).filter(User.id>1)
   db.session.query(User).filter(User.id>=1)
   db.session.query(User).filter(User.id.in_([1,2,3]))
   db.session.query(User).filter(User.name.like("%ding%"))
   ```

   b. `filter_by` 方法接受的是 `**kwargs`，仅支持 相等查询

   ```
   db.session.query(User).filter_by(id=1)
   db.session.query(User).filter_by(id=1, name=2)
   ```

2. **OR 查询**

   ```python
   db.session.query(User).filter(or_(User.id == 1, User.id == 2)
   ```

3. **排序**

   Query 对象包含含有 order_by 方法，下面举例说明：

   ```python
   db.session.query(User).order_by(User.id)
   db.session.query(User).order_by(User.id.asc())
   db.session.query(User).order_by(User.id.desc())
   db.session.query(User).order_by(-User.id) # 注意 -User.id 与 User.id.desc() 是有区别的
   db.session.query(User).order_by(User.id, User.name)
   ```

   order_by 依然返回 Query 对象

4. **结果获取**

   a. 获取全部结果

   ```python
   # 方式一
    db.session.query(User).all()
    # 方式二直接遍历
    for item in db.session.query(User):
      pass
   ```

   b. 获取单条结果

   ```python
   # 获取第一条，没有结果返回None，多条结果返回第一条
   db.session.query(User).first()

   # 获取一条，且结果必须为一条，没有结果或者多条结果均抛出异常
   db.session.query(User).one()

   # 获取一条，没有结果返回None，多条结果抛出异常
   db.session.query(User).one_or_none()

   # 获取一条结果的第一列， 一般用于 选择单列结果的情况
   >>> db.session.query(Item).scalar()
   <Item>
   >>> db.session.query(Item.id).scalar()
   1
   >>> db.session.query(Item.id).filter(Item.id < 0).scalar()
   None
   >>> db.session.query(Item.id, Item.name).scalar()
   1
   >>> db.session.query(func.count(Parent.id)).scalar()
   20
   ```

   c. 结果的类型

   查询的结果有两种类型

   一种是 Model， 一种是 [KeyedTuple](https://docs.sqlalchemy.org/en/13/orm/query.html?highlight=one#sqlalchemy.util.KeyedTuple)

   只有当 query 的目标为单个 Model 的时候，返回类型为 Model

   ```python
   >>> db.session.query(User).first()
   <User 1>

   # torn 封装的简化写法 (学习了 `flask_sqlalchemy`)
   >>> User.query.first()
   <User 1>
   ```

   当 query 的目标为多个 Model 或者列的时候，返回的类型为 KeyedTuple。
   KeyedTuple 既可以使用`下标`、也可以使用 `.` 获取属性

   ```python
   >>> item = db.session.query(User.id, User.name).first()
   [(1, 'ding')]
   >>> item.id
   1
   >>> item[0]
   1
   ```

5. **分页**

   a. 基本用法：

   ```python
   db.session.query(User).offset(10).limit(10)
   ```

   b. 使用 `torn.db3.paginate` 方法 替换老版本 `torn.paginator.pagination`

   依然举例说明：

   ```python
   from torn.db3 import paginate

   query = User.query
   # 参数相同，但是只返回一个pagination对象
   pagination = paginate(query, self.request.request_params)
   data = {
       'total': pagination.total,
       'pages': pagination.pages,
       'items': pagination.items
   }
   ```

   `paginate` 方法 返回的 `Pagination` 类型包含如下属性:

   | 属性          | 类型 | 说明           |
   | :------------ | :--- | :------------- |
   | items         | list | 当前页对象列表 |
   | page          | int  | 当前页         |
   | page_size     | int  | 每页尺寸       |
   | total         | int  | 总结果数       |
   | pages         | int  | 总页数         |
   | previous_page | int  | 上一页         |
   | next_page     | int  | 下一页         |
   | has_previous  | bool | 是否有上一页   |
   | has_next      | bool | 是否有下一页   |

   当然你也可以直接调用 `_paginate(query, page, page_size)` 来进行分页

## 二、创建、更新与删除

1. 创建

   ```python
   # model定义
   class User(db.Model):
     id = Column(Integer)
     name = Column(String)

   user1 = User()
   user2 = User()

   db.session.add(user1)
   db.session.commit()

   db.session.add_all([user1, user2])
   db.session.commit()
   ```

2. 更新

   ```python
   # 查询出来的对象已经关联到session，修改之后直接commit即可，不需要 add 到session
   user = User.query.filter_by(id=1)
   user.name = 'ding'
   db.session.commit()

   # 直接根据查询条件更新
   User.query.filter(id=1).update({'name': 'ding'})
   db.session.commit()

   # in 操作无法更新session内对象， 要手动关闭同步session， 所以最好立即提交，避免数据不一致
   User.query.filter(id.in_([1, 2, 3]).update({User.name: "ding"}, synchronize_session=False)
   User.query.filter(id.in_([1, 2, 3]).update({"name": "ding"}), synchronize_session=False)
   db.session.commit() # or session.expire_all()
   ```

3. 删除

   ```python
   User.query.filter_by(id=1).delete()
   User.query.filter(id.in_([1, 2, 3]).delete(synchronize_session=False)
   ```

## 三、session 管理

1. **SQLAlchemy 中的 [session](https://docs.sqlalchemy.org/en/13/orm/session.html) 是什么？**

   session 对象代表了一个或多个事务。

2. **获取 session 对象**

   在 sqlalchemy 中可以通过如下方式创建 session

   ```python
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker

   some_engine = create_engine('postgresql://scott:tiger@localhost/')
   Session = sessionmaker(bind=some_engine)
   session = Session()
   ```

   在 torn 中，通过如下方式获取 session

   ```python
   from torn.db3 import db
   db.session
   ```

   通过 `db.session` 即可引用一个 `scoped_session` 对象，在不同的协程、不同的线程中互相独立。在使用 `db.session.some_attribute` 的时候，如果发现当前上下文中 db.session 未创建，则会自动创建一个 session，实现懒加载。

3. **session 的提交、回滚、关闭**

   **提交**：上面提到了 session 代表事务，那么使用 session 进行修改数据后提交就是很关键的一步了。 使用 `db.session.commit()` 即可提交事务，事务中相关联的 Model 对象的修改，会被转换成 update 语句提交到数据库。

   **回滚**：如果想放弃修改使用 `db.session.rollback()` 即可

   **关闭**：业务的最后千万别忘了使用 `db.session.close()` 关闭 session， 这个操作将会关闭事务会话，将打开的数据库连接放回到 连接池。

   备注：

   对于在 torn 项目中， 继承自 `APIRequestHandler`的 Handler，可以不必处理 `db.session.close()`， 因为在 `APIRequestHandler` 中的 `on_finish` 里面会统一调用 `db.session.close()`.

   **但是对于 `task` 中的代码，需要手动处理 session 的关闭，否则会引起阻塞。**

   推荐的写法：

   ```python
   from contextlib import closing

   with closing(db.session):
     db.session.query(xx)
     ...
   ```

## 四、Torn 的附加功能

1. **Query 对象**

   ```python
   # torn 为 Model 增加了query 属性
   User.query
   # 等价于
   db.session.query(User)

   ```

2. **Model 的新方法**

   torn 在 `torn.db3.Model` 基类中添加了如下方法：

   查询方法： `findone`, `latest`, `getall`， 删除方法 `delete `

   ```python
   @classmethod
   def findone(cls, **kwargs):
       return cls.query.filter_by(**kwargs).first()

   @classmethod
   def latest(cls, **kwargs):
       return cls.query.filter_by(**kwargs).order_by(cls.id.desc()).first()

   @classmethod
   def getall(cls, **kwargs):
       return cls.query.filter_by(**kwargs)

   def delete(self):
       self.query.filter_by(id=self.id).delete()
       db.session.commit()
   ```

   以及辅助方法: 获取所有字段名 `_all_fields `, 过滤有效属性 `filter_fields`

   ```python
   @classmethod
   def _all_fields(cls):
       return [c.name for c in cls.__table__.columns]

   @classmethod
   def filter_fields(cls, data):
       return {k: v for k, v in data.items() if hasattr(cls, k)}
   ```

   使用示例：

   ```python
   # 创建对象
   user = User(**User.filter_fields(kwargs))
   db.session.add(user)
   db.session.commit()
   ```

3. **新增 Model 的 `show_fields` 和 `to_dict`方法，简化 API 结果序列化**

   CJSONEncoder 默认调用 model 的 `to_dict` 方法来实现序列化，现在可以放心在 `self.jsonify(data)` 中包含 model 对象。 默认的 `to_dict` 返回所有的字段，如果需要改变这一行为，请重载 `show_fields` 或者 `to_dict`.

   下面举例说明使用方法：

   ```python
   # 重载show_fields方法， 设置返回字段
   class User(db.Model)

       @classmethod
       def show_fields(cls):
           return ('id', 'name', 'email')
   ```

   ```python
   # 直接重载 to_dict 方法
   class User(db.Model)
       def to_dict(self):
           data = super().to_dict()
           data['hasNew'] = bool(data['new'])
           data['markets_support'] = json.loads(data['markets_support'])
           return data
   ```

   Model 的`to_dict`方法接受一个 `fields` 参数， 可以是下面三种

   1. `None` : 使用 `show_fields` 方法的定义
   2. `"all"` : 所有字段
   3. `["字段1", "字段2"]` : 自定的字段列表

## 五、Q&A:

1. **如何只加载指定的列?**

   A: 使用 load_only

   ```python
   >>> from sqlalchemy.orm import load_only
   >>> db.session.query(User).options(load_only('id', 'name')).first()
   <User 1>
   ```

   注意，如果访问 `load_only` 之外的属性，会重新查询数据库。

   B: query 指定需要返回的列

   ```python
   >>> from sqlalchemy.orm import load_only
   >>> db.session.query(User.id, User.name).first()
   (1, 'ding')
   ```

2. **如何使用自定义语句？**
