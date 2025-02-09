---
layout: doc
title: "PDF 表单格式解析与填充操作"
date: 2022-05-01 00:00:00 +0800
category: "杂项"
---

> 本文写给使用缺少高级 PDF 操作库的语言的开发者，用以粗略了解 PDF Form 的格式定义

文本主要知识参考自权威文档：[《PDF Reference 1.7 》](https://www.verypdf.com/document/pdf-format-reference/index.htm)

## 1. PDF 表单格式解析

### 1.1 基本知识

PDF 文档结构是由一系列小的对象构成的，有 8 中基本对象类型：

Boolean、Integer and real numbers、Strings、Names、Arrays、Dictionaries、Steams、 Null

本文重点探索的表单本质上是 Annotation （包含注释、高亮等一些信息）的一种子类型（代码中表示为：Widget），这点可以通过下面的解析文件表示看出来。

这是一个 文本框 组件的表示：

```json
// 整体是一个字典
<<
        <DA, (/HelveticaLTStd-Bold 8.00 Tf 0.000 0.000 0.502 rg)>
        <F, 4>
        <FT, Tx>                    // （Field Type） 表示字段类型（Btn 按钮、Tx 文本、Ch 选择、Sig 签名）
        <Ff, 8388608>
        <MK, <<
        >>>
        <P, (265 0 R)>
        <Parent, (18 0 R)>
        <Q, 0>
        <Rect, [36.00 540.01 374.40 554.01]> // Rect 表示位置
        <StructParent, 1>
        <T, (email)>
        <V, (a@126.com)>
        <Type, Annot>             // 表单本质类型是 Annotation -> Widget
        <Subtype, Widget>
>>
```

### 1.2 表单控件类型

![1](/blog/assets/img/2022-05-01-pdf-2.png)

FT 只有 4 种类型： Tx、Btn、Ch、Sig，但是上图中的组件类型有 7 种，为什么不一样多呢？

因为 CheckBox、Group、 Button 都是 Btn 类型，Dropdown、ListBox 都是 Ch 类型，他们是 通过 AP （Appearance）属性区分的。

### 1.2 文本输入框

下面是一个 文本输入框 的基本结构（使用 pdfcpu 的表示方法）：

```json
<<
        <DA, (/HelveticaLTStd-Bold 8.00 Tf 0.000 0.000 0.502 rg)>  // （default appearance） 可以设置字体颜色等
        <F, 4>
        <FT, Tx>                    // （Field Type） 表示字段类型（Btn 按钮、Tx 文本、Ch 选择、Sig 签名）
        <Ff, 8388608>           // （Field Flag）Ff 表示字段标识位（可以设置只读、必填、不可导出3种）
        <MK, <<
        >>>
        <P, (265 0 R)>
        <Parent, (18 0 R)>
        <Q, 0>
        <Rect, [36.00 540.01 374.40 554.01]> // Rect 表示位置
        <StructParent, 1>
        <T, (email)>                  // T 表示字段名称
        <V, (a@126.com)>         // （Vlaue） 表示填充的值
        <Type, Annot>             // 表单本质类型是 Annotation -> Widget
        <Subtype, Widget>
>>
```

以上具体可以参考 《PDF Reference 1.7 》 P675

所以我们可以通过直接设置 V 属性的方式为文本框填入数据；设置 DA 改变样式；设置 Ff 设置只读、必填等。

### 1.3 Checkbox 勾选框

下面是一个 Checkbox 的基本结构（使用 pdfcpu 的表示方法）：

```json
<<
        <AP, <<   // Appearance ，可以定义 D、N、R 三种状态下的样式
                <D, << // Down 样式 （鼠标点击时）
                        <1, (267 0 R)>   // 1 状态的样式
                        <Off, (268 0 R)> // Off 状态的样式
                >>>
                <N, << // Nornal 样式（无任何交互）
                        <1, (266 0 R)>
                >>>
        >>>
        <AS, Off>  // Appearance State 当前状态
        <DA, (/ZaDb 5.6 Tf 0 g /ZaDb 5.6 Tf 0 g )>
        <F, 4>
        <FT, Btn>
        <MK, <<
                <CA, (4)>
        >>>
        <P, (265 0 R)>
        <Parent, (18 0 R)>
        <Rect, [563.60 410.01 571.60 418.01]>
        <StructParent, 11>
        <Subtype, Widget>
        <T, <FEFF00630031005F00300031005B0030005D>>
        <Type, Annot>
>>
```

上面结构中与 Checkbox 相关的属性有 AP 和 AS 分别来介绍

AP：用来定义具体的组件及样式。 AP 可以有 3 个 Key： N（Normal 无交互）、R（Rollover 鼠标悬浮）、Down（鼠标点击），其中 N 是必填，其他两个是可选的。每中交互状态下还可以定义多个自定义状态。比如上面的示例中，就定义了 状态 1 和 状态 Off。

AS：Appearance State，组件的当前状态，必须是 AP 中定义的状态其中之一。

## 2. 使用 Golang 进行 PDF 表单填充

Golang 可以进行的 PDF 操作的库有比较完善但是收费的：

1. [pdftron](https://www.pdftron.com/documentation/linux/guides/features/forms/)
2. [unipdf](https://github.com/unidoc/unipdf)

相对完善，但是不支持表单操作高级 API 的

1. [pdfcpu](https://github.com/pdfcpu/pdfcpu)

pdfcpu 作者表示会在下个版本支持表单操作，但是鉴于其半年发布一次的频率，于是决定尝试使用其低级别 API 实现 Form 表单填充。

有了 PDF 文件格式的一些知识之后，摸索着开发了 [基于 pdfcpu 的表单填充](https://gist.github.com/dingyaguang117/28352dfd98364fd52cec71bd6b365efa) 示例

## 3. 常用工具

下面是在探索 PDF 格式、填充 PDF 表单操作时发现使用的一些工具

#### 3.1 [mupdf](https://mupdf.com/) （PDF 查看与操作）

支持功能:

1. 修复 PDF （很多 PDF 编辑器对 PDF 进行编辑后，可能生成的 PDF 并不符合规范：少一些属性、重复一些属性）

   ```bash
   mutool clean in.pdf out.pdf
   ```

2. 展示 PDF 文件信息

   ```bash
   # 展示 PDF 文件内的表单
   mutool show  fw8ben.pdf form
   ```

#### 3.2 [pdfcpu](https://github.com/pdfcpu/pdfcpu)（PDF 查看与操作）

支持功能：

1. 抽取图片
2. 添加水印
3. 文件校验
4. 合并 PDF
5. 创建页面
6. 附件操作
7. Annotation 操作

#### 3.3 [iText 7 RUPS](https://github.com/itext/i7j-rups/releases)（GUI PDF 文件查看）

![1](/blog/assets/img/2022-05-01-pdf-1.jpg)
