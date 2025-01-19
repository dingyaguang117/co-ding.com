---
layout: doc
title: "58 同城验证码识别"
date: 2013-03-03 15:04:02 +0800
---

乍一看验证码还挺吓人的，背景杂点线条都有，字符也是变形的。

不过经过仔细观察，字符虽然是经过变形的，但是每个字符都是一样的....也就是可以通过字模匹配来完成识别了..

第一步：二值化

原始图：

![](/blog/assets/img/2013-03-03-58ImgRecognize-1.jpg)

灰度图：

![](/blog/assets/img/2013-03-03-58ImgRecognize-2.bmp)

二值化图：

![](/blog/assets/img/2013-03-03-58ImgRecognize-3.bmp)

二值化要先选择一个阈值，然后按照灰度进行分类

```python
#二值化
def calcThreshold(img):
    im=Image.open(img)
    L = im.convert('L').histogram()
    sum = 0
    threshold = 0
    for i in xrange(len(L)):
        sum += L[i]
        if sum >= 530:
            threshold = i
            break
    return threshold

def binaryzation(img,threshold = 90):
    table = []
    for i in range(256):
        if i < threshold:
            table.append(0)
        else:
            table.append(1)
    im=Image.open(img)
    imgry = im.convert('L')
    imout = imgry.point(table,'1')
    return imout
```

第二步：抽取字符

先用 floodfill 把连片的点抽取出来，去除太小的片(杂点)，然后对其到(0,0)

```python
'''
抽取出字符矩阵 列表
'''
def extractChar(im):
    OFFSETLIST = [(1,0),(0,1),(-1,0),(0,-1),(1,1),(-1,1),(1,-1),(-1,-1)]
    pixelAccess = im.load()
    num = 1
    queue = []
    ff = [[0]*im.size[1] for i in xrange(im.size[0])]

    '''
        floodfill 提出块
    '''

    for i in xrange(im.size[0]):
        for j in xrange(im.size[1]):
            '''
                pixelAccess[i,j] == 0 表示是黑点
            '''
            if pixelAccess[i,j] == 0 and ff[i][j] == 0:
                ff[i][j] = num
                queue.append((i,j))
                while len(queue) > 0 :
                    a,b = queue[0]
                    queue = queue[1:]
                    for offset1,offset2 in OFFSETLIST:
                        x,y = a + offset1, b + offset2
                        if x < 0 or x >= im.size[0]:continue
                        if y < 0 or y >= im.size[1]:continue
                        if pixelAccess[x,y] == 0 and ff[x][y] == 0:
                            ff[x][y] = num
                            queue.append((x,y))

                num += 1
    '''
        字符点阵的坐标列表，对齐到 (0,0)
        eg: [(1,2),(3,24),(54,23)]
    '''
    #初始化字符数组
    info = {
            "x_min":im.size[0],
            "y_min":im.size[1],
            "x_max":0,
            "y_max":0,
            "width":0,
            "height":0,
            "number":0,
            "points":[]
    }
    charList = [copy.deepcopy(info) for i in xrange(num)]
    #统计
    for i in xrange(im.size[0]):
        for j in xrange(im.size[1]):
            if ff[i][j] == 0:
                continue
            id = ff[i][j]
            if i < charList[id]['x_min']:charList[id]['x_min'] = i
            if j < charList[id]['y_min']:charList[id]['y_min'] = j
            if i > charList[id]['x_max']:charList[id]['x_max'] = i
            if j > charList[id]['y_max']:charList[id]['y_max'] = j
            charList[id]['number'] += 1
            charList[id]['points'].append((i,j))
    for i in xrange(num):
        charList[i]['width'] = charList[i]['x_max'] - charList[i]['x_min'] + 1
        charList[i]['height'] = charList[i]['y_max'] - charList[i]['y_min'] + 1
        #修正偏移
        charList[i]['points'] = [(x-charList[i]['x_min'], y-charList[i]['y_min']) for x,y in charList[i]['points'] ]
    #过滤杂点
    ret = [one for one in charList if one['number'] > 4]
    #排序
    ret.sort(lambda a,b:a['x_min'] < b['x_min'])
    return ret
```

第三步：识别字符

用预先整理好的字模数据跟每个 抽取出来的字符，进行比较。
由于可能抽取出来的字符和字模的长宽不太一致，所以需要进行“晃动”全匹配，取最大相似度的

```python
'''
    识别字符
'''

def charSimilarity(charA,charB):
    s2 = set([(one[0],one[1]) for one in charB['points']])
    sumlen = len(charA['points']) + len(charB['points'])
    max = 0
    # 晃动匹配
    i_adjust = 1 if charB['width'] - charA['width'] >= 0 else -1
    j_adjust = 1 if charB['height'] - charA['height'] >= 0 else -1
    for i in xrange(0,charB['width'] - charA['width'] + i_adjust,i_adjust):
        for j in xrange(0,charB['height'] - charA['height'] + j_adjust,j_adjust):
            s1 = set([(one[0]+i,one[1]+j) for one in charA['points']])
            sim = len(s1&s2) *2.0 / sumlen
            if sim > max:
                max = sim
    return max


def recognise(one):
    max = 0
    ret = None
    for char in CharMatrix:
        s = charSimilarity(one,CharMatrix[char])
        #print s * 100,"%"
        if s > max:
            ret = char
            max = s
    return ret
```

整个步骤的顺序就是这样的：

```python
'''
    识别验证码
'''
def DoWork(img):
    ans = []
    threshold = calcThreshold(img)
    print 'threshold:',threshold
    im = binaryzation(img,threshold)
    chars = extractChar(im)
    for one in chars:
        ans.append(recognise(one))
    return ans
```

完整代码：https://github.com/dingyaguang117/hack58/blob/master/hack58/src/ocr58.py

识别正确率应该在 70%左右，二值化没有做太多优化。。
识别效果图：

[图片因故障丢失]
