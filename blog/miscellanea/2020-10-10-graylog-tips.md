---
layout: doc
title: "Graylog Tips"
date: 2020-10-10 15:04:02 +0800
category: "随手记"
hidden: true
---

## 一、日志分词

1 分词会通过空格、符号对日志进行切割，但是 `.` 和 `_` 不会作为分割符号。以如下日志举例:

`[INFO 201010 10:43:12 RequestID:488-160229779218618 web:76] 200 GET /api/v1/individual/account/info?vendor=xiaomi&osVer=10&platform=android&appName=TigerTrade&appVer=6.8.8.1&device=MI%208%20SE&deviceId=51dd6a98-80e8-4c61-9d0c-5f709937a63e&screenH=2029&skin=1&screenW=1080&lang=zh_CN&edition=full&region=CHN&location=CHN&customer_id=6854201766870 (223.104.170.165) 26.40ms 10000`

此行日志会被分割为:

`INFO` `201010` `10` `43` `12` `RequestID` `488` `160229779218618` `web` `76` `200` `GET`
`api` `v1` `individual` `account` `info` `vender` `xiaomi` `osVer` `10` `platform` `android` `appName` `TigerTrade` `appVer` `6.8.8.1` `device` `MI` `208` `20SE` `deviceId` `51dd6a98` `80e8` `4c61` `9d0c` `5f709937a63e` `screenH` `2029` `skin` `1` `screenW` `1080` `lang` `zh_CN` `edition` `full` `region` `CHN` `location` `CHN` `customer_id` `6854201766870` `223.104.170.165` `26.40ms` `10000`

注意: 其中的 `6.8.8.1` 和 `customer_id` 是作为一个完整的词的。

## 二、检索

1. 因为索引是按照 **词** 进行索引的，所以搜索条件必须包含 **完整的词**。
   > 比如对于上面的日志，搜索 `customer` 是无法查询到的，必须查询 `customer_id`
2. 逻辑 `AND` `OR` 必须 **大写**， 否则会被当做搜索词
3. 数字可以支持 `>` `>=` `<` `<=`
4. `& | : \ / + - ! ( ) { } [ ] ^ " ~ * ?` 这些符号需要转义（或者用双引号括起来）
   > `RequestID\:488\-160229779218618` 等价于 `"RequestID:488-160229779218618"`
5. 正则表达式 使用 **双斜线** `/正则/`
   > 比如使用 `/[0-9]{3,4}.[0-9]{2}ms/` 搜索 大于 100ms 的请求

参考：

1. [官方文档](https://docs.graylog.org/en/3.3/pages/searching/query_language.html)
