---
title: "Python 实现支持 Unicode 中文的 AC 自动机"
date: 2012-05-26 15:04:02 +0800
---

最近开始从分析数据，要从大量短文本中匹配很多关键字，如果暴力 find 的话，发现 CPU 成为了瓶颈，于是想到了 AC 自动机

AC 自动机是多模式匹配的一个经典数据结构，原理是和 KMP 一样的构造 fail 指针，不过 AC 自动机是在 Trie 树上构造的，但原理是一样的。

为了能够匹配 unicode，我讲 unicode 编码之后，按照每 4 位进行索引，变成了 16 叉 trie 树。

下面是纯 Python 版本:

```python
#coding=utf-8
import math

class Node():
    static = 0
    def __init__(self,KIND):
        self.fail = None
        self.next = [None]*KIND
        self.end = False
        self.word = None
        Node.static += 1

class AcAutomaton():
    def __init__(self,KIND=16):
        self.root = Node(KIND)
        self.queue = []
        self.KIND = KIND

    def getIndex(self,char):
        return ord(char)# - BASE

    def insert(self,string):
        p = self.root
        for char in string:
            index = self.getIndex(char)
            if p.next[index] == None:
                p.next[index] = Node(self.KIND)
            p = p.next[index]
        p.end = True
        p.word = string

    def build_automaton(self):
        self.root.fail = None
        self.queue.append(self.root)
        while len(self.queue)!=0:
            parent = self.queue[0]
            self.queue.pop(0)
            for i,child in enumerate(parent.next):
                if child == None:continue
                if parent == self.root:
                    child.fail = self.root
                else:
                    failp = parent.fail
                    while failp != None:
                        if failp.next[i] != None:
                            child.fail = failp.next[i]
                            break
                        failp = failp.fail
                    if failp==None: child.fail=self.root
                self.queue.append(child)

    def matchOne(self,string):
        p = self.root
        for char in string:
            index = self.getIndex(char)
            while p.next[index]==None and p!=self.root: p=p.fail
            if p.next[index]==None:p=self.root
            else: p=p.next[index]
            if p.end:return True,p.word
        return False,None


class UnicodeAcAutomaton():
    def __init__(self,KIND=16,encoding='utf-8'):
        '''
            KIND must can be 2^i  at most 2^8
        '''
        self.ac = AcAutomaton(KIND)
        self.encoding = encoding
        self.KIND = KIND
        self.KNUM = int(math.log(256)/math.log(KIND) + 0.1)
        print self.KIND,self.KNUM

    def getAcString(self,string):
        string = bytearray(string.encode(self.encoding))
        ac_string = ''
        for byte in string:
            for i in xrange(self.KNUM):
                ac_string += chr(byte%self.KIND)
                byte /= self.KIND
        return ac_string

    def insert(self,string):
        if type(string) != unicode:
            raise Exception('UnicodeAcAutomaton:: insert type not unicode')
        ac_string = self.getAcString(string)
        self.ac.insert(ac_string)

    def build_automaton(self):
        self.ac.build_automaton()

    def matchOne(self,string):
        if type(string) != unicode:
            raise Exception('UnicodeAcAutomaton:: insert type not unicode')
        ac_string = self.getAcString(string)
        retcode,ret = self.ac.matchOne(ac_string)
        if ret!=None:
            s = ''
            for i in range(len(ret)/self.KNUM):
                base = 1
                c = 0
                for j in xrange(self.KNUM):
                    c += ord(ret[self.KNUM*i+j]) * base
                    base *= self.KIND
                s += chr(c)
            ret = s.decode(self.encoding)
        return retcode,ret


def main():
    ac = UnicodeAcAutomaton()
    ac.insert(u'丁亚光')
    ac.insert(u'好吃的')
    ac.insert(u'好玩的')
    ac.build_automaton()
    print ac.matchOne(u'hi,丁亚光在干啥')
    print ac.matchOne(u'ab')
    print ac.matchOne(u'不能吃饭啊')
    print ac.matchOne(u'饭很好吃，有很多好好的吃的，')
    print ac.matchOne(u'有很多好玩的')

if __name__ == '__main__':
    main()
```

测试结果:

> 关键词数是 2000，长度 2-12
> 文本长度为 60-80，分别测试 4000 条文本和 300000 条文本的速度
> 速度分别为 5.5s 和 619.8s

附项目地址：

- [纯 Python 版本代码](https://github.com/dingyaguang117/PythonGist/blob/master/UnicodeAcAutomaton.py)

- [发布到 pip 的版本](https://github.com/dingyaguang117/ACAutomaton)

  使用 C++实现算法部分, 效率大幅提升，可以直接使用`pip install ACAutomaton`安装
