---
layout: doc
title: "BloomFilter - 布隆过滤器"
date: 2012-10-08 15:04:02 +0800
category: "算法&数据结构"
---

## BloomFilter 介绍与实现

因为可能有海量的爬取任务，所以需要一个排重服务支持，BloomFilter 是一个基于 hash+概率的比较省空间的算法。大概的意思就是：将一个 key 多次 hash 然后填充到相应的位，判断一个 key 是否存在就是看这个 key 的每个 hash 到的位是否标识。当然 hash 的次数是有讲究的，与 hash 空间的大小和待 hash 的 item 数量有关系，wiki 里面也讲解了如果选取 hash 个数使得误判率最低。这篇文章写得比较清楚：http://www.cnblogs.com/allensun/archive/2011/02/16/1956532.html

下面是 Bloom Filter 的 java 实现的代码：
自己实现了一个 bitset(名字是抄 C++ STL 的)，因为 jvm 的数组只能用 int 型作为 size，所以只能开这么大了。。不知道 64 位的是不是可以用 long

```java
package co.huohua.BloomFilter;

public class BitSet {

    private long length;
    private byte[] data;
    private int k = 8;

    public BitSet(long size)
    {
        length = size;
        int t = (int)(size/8);
        if (size%8 >0) t+=1;
        data = new byte[t];
    }

    public void set(long pos)
    {
        int p = (int)(pos/k);
        int pp = (int)(pos%k);
        data[p] |= 1<<pp;
    }
    public boolean get(long pos)
    {
        int p = (int)(pos/k);
        int pp = (int)(pos%k);
        return (data[p] & (1<<pp)) > 0;
    }

}
```

下面是 BloomFilter 的核心，hash 函数的生成我是用一大堆质数每次类乘实现的。因为习惯问题，数据结构总喜欢写成模板（java 里面叫泛型）。

```java
package co.huohua.BloomFilter;
import java.lang.Math;
import co.huohua.BloomFilter.BitSet;

public class BloomFilter<T extends Object>{

    private BitSet bitSet = null;
    private long bitnum;
    private int f_num;
    private int seed[] = new int[]{31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997};
    public BloomFilter(long bitnum,long expect_num) throws Exception
    {
        //xxxx
        if (bitnum > 1L<<33) throw new Exception("bitnum at most 1L<<33");

        //xxxx
        this.bitnum = bitnum;
        int efn =  calc_f_num(this.bitnum,expect_num);
        this.f_num = efn > seed.length ? seed.length : efn;
        this.bitSet = new BitSet(this.bitnum);

        System.out.println(efn);
        System.out.println(calc_error(this.bitnum,expect_num));
    }

    private int calc_f_num(long bitnum,long expect_num)
    {
        return (int)(Math.log(2)*bitnum/expect_num);
    }

    private double calc_error(long bitnum,long expect_num)
    {
        return Math.pow(2, -1*Math.log(2)*bitnum/expect_num);
    }

    private long hash(String line,int n)
    {
        long h = 0;
        int len = line.length();
        for (int i = 0; i < len; i++)
        {
            h = n * h + line.charAt(i);
        }
        return check(h);
    }
    private long check(long h) {
        return Math.abs(h % this.bitnum);
    }

    public void put(T item)
    {
        for(int i=0;i<f_num;++i)
        {
            String s = item.toString();
            bitSet.set(hash(s,seed[i]));
        }
    }

    public boolean test(T item)
    {
        for(int i=0;i<f_num;++i)
        {
            String s = item.toString();
            if (!bitSet.get(hash(s,seed[i]))) return false;
        }
        return true;
    }

    @Override
    public String toString()
    {

        return this.bitSet.toString();
    }

    public static void main(String []args) throws Exception
    {

        BloomFilter<String> a = new BloomFilter<String>(1L<<33,500000000);

        a.put("a");
        System.out.println(a.test("a"));
        System.out.println(a.test("b"));
        System.out.println(a.test("c"));

        a.put("afsdfasdfasdfasdfasdfsdgdfhdfyetjkhkylk46568yh.lmndrstgfkhl,jh");
        System.out.println(a.test("afsdfasdfasdfasdfasdfsdgdfhdfyetjkhkylk46568yh.lmndrstgfkhl,jh"));
        System.out.println(a.test("bfsdfasdfasdfasdf"));
        System.out.println(a.test("cfasdfsdghjgkuhlk"));
    }
}
```

## 使用 Thrift 搭建服务

Thrift 是 facebook 的一个内部程序通讯框架，用来解决跨语言的问题。

Thrift 的实现就是：

1. 先规定好通讯的数据格式，和接口格式。
2. Thrift 根据你选择的语言，生成一份这些语言的框架代码

一般情况下，这份代码里面会有 2 个抽象类（一个是 client 类，一个是 server 类），类里面的方法就是第一步中规定的接口。然后你自己 implement 一下 server 类，实现一下这些接口方法就行了~

然后就可以像调用函数一样从 client 类里面调用其他程序的服务了。

这是接口的定义:bloomfilter.thrift

```json
service BloomFilterThrift
{
    bool query(1:string s);
    void add(1:string s);
    bool queryAndAdd(1:string s);
    void store();
}
```

使用 thrift 生成代码：
thrift --gen py java bloomfilter.thrift

会生成 gen-java 和 gen-py 的目录,然后将生成的代码放到你的工程里面就行啦~

下面是 java 实现的 server 类

```java
package co.huohua.ThriftServer;
import org.apache.thrift.TException;
import co.huohua.BloomFilter.BloomFilter;

public class BloomFilterThriftImpl implements BloomFilterThrift.Iface {
    BloomFilter bf = null;

    public BloomFilterThriftImpl(long bit_num,long expect_num) throws Exception
    {
        bf = new BloomFilter(bit_num,expect_num);
    }

    @Override
    public boolean query(String s) throws TException {
        // TODO Auto-generated method stub
        return bf.test(s);
    }

    @Override
    public void add(String s) throws TException {
        bf.put(s);
    }

    @Override
    public boolean queryAndAdd(String s) throws TException {
        boolean r = bf.test(s);
        bf.put(s);
        return r;
    }

    @Override
    public void store() throws TException {
        // TODO Auto-generated method stub
    }
}
```

然后在主程序里面启动 server 就 ok 了~可以监听端口，提供服务了：

```java
package co.huohua.ThriftServer;

import org.apache.thrift.TProcessor;
import org.apache.thrift.protocol.TBinaryProtocol;
import org.apache.thrift.protocol.TBinaryProtocol.Factory;
import org.apache.thrift.server.TServer;
import org.apache.thrift.server.TThreadPoolServer;
import org.apache.thrift.transport.TServerSocket;
import org.apache.thrift.transport.TTransportException;

import co.huohua.ThriftServer.BloomFilterThriftImpl;

public class Main {

    private void run(long bitnum,long expectnum) throws Exception
    {
        //构造transport类
        TServerSocket transport = new TServerSocket(9090);
        //构造 处理器
        TProcessor processor = new BloomFilterThrift.Processor(new BloomFilterThriftImpl(bitnum,expectnum));
        //构造传输协议工厂类
        Factory proFactory = new TBinaryProtocol.Factory();
        //构造 Server的构造函数需要的参数
        TThreadPoolServer.Args argss = new TThreadPoolServer.Args(transport);
        argss.inputProtocolFactory(proFactory);
        argss.outputProtocolFactory(proFactory);
        argss = argss.processor(processor);
        argss.maxWorkerThreads = 10;

        TServer server = new TThreadPoolServer(argss);
        System.out.println("server running...");
        server.serve();
    }

    public static void main(String[] args) throws Exception {

        if (args.length != 2)
        {
            System.out.println("java -jar xxx.jar bitnum expectnum");
            return;
        }
        long bitnum = Integer.parseInt(args[0]);
        long expectnum = Integer.parseInt(args[1]);

        Main main = new Main();
        main.run(bitnum,expectnum);
    }

}
```

可以看到代码里面，一层层的组件了很多，其实每一层都是有很多可选的组件的，比如传输可以选择二进制或者 json 呀，服务器可以用 ThreadPool 或者进程池等等。具体要仔细看下 doc，而且不同的语言并不相同，因为可能有些语言某些组件并不容易实现吧。

接下来展示用 python 如何调用这个服务：

```python
import sys
sys.path.append('./gen-py')

from bloomfilter import BloomFilterThrift
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

try:
    transport = TSocket.TSocket('127.0.0.1', 9090)
    transport = TTransport.TBufferedTransport(transport)
    protocol = TBinaryProtocol.TBinaryProtocol(transport)
    client = BloomFilterThrift.Client(protocol)
    transport.open()

    print client.query('dingyaguang117')

    transport.close()

except Thrift.TException, ex:
    print "%s" % (ex.message)
```

其中 BloomFilterThrift.Client 就是生成的 Client 类啦！

当时在学 thrift 的时候看了一下，用的公司除了 facebook，还有人人网啊，evernote。。貌似并不是很多~
可能还有其他优秀的框架吧~~
希望本文对大家学习 Thrift 有帮助~

注：后来测试了一下 thrift 下的 BloomFilter，速度非常快，本来以为 hash 会略慢。误判率和理论值非常接近，当然，数据是慢慢填进去的，在一开始的很长一段时间，都是没有误判的，后来逐渐上升到 5%。。。

[代码地址](https://github.com/dingyaguang117/BloomFilter)
