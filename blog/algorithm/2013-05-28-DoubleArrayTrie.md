---
layout: doc
title: "Double Array Trie - 双数组 Trie 树 （Java 实现）"
date: 2012-05-28 15:04:02 +0800
category: "算法&数据结构"
---

## 双数组 Trie 树 介绍

传统的 Trie 实现简单，但是占用的空间实在是难以接受，特别是当字符集不仅限于英文 26 个字符的时候，爆炸起来的空间根本无法接受。

双数组 Trie 就是优化了空间的 Trie 树，原理本基本就是用一个数组代替每个节点单独分配空间，如果这课 Trie 数特别稀疏，那么各个节点之间的存储空间可以在不发生冲突的情况下重叠。

具体请参考这篇论文[An Efficient Implementation of Trie Structures](/blog/assets/pdf/dat.pdf)，本程序的编写也是参考这篇论文的。

关于几点论文没有提及的细节和与论文不一一致的实现：

1.对于插入字符串，如果有一个字符串是另一个字符串的子串的话，我是将结束符也作为一条边，产生一个新的结点，这个结点新节点的 Base 我置为 0

所以一个字符串结束也有 2 中情况：一个是 Base 值为负，存储剩余字符(可能只有一个结束符)到 Tail 数组；另一个是 Base 为 0。

所以在查询的时候要考虑一下这两种情况

2.对于第一种冲突（论文中的 Case 3），可能要将 Tail 中的字符串取出一部分，作为边放到索引中。论文是使用将尾串左移的方式，我的方式直接修改 Base 值，而不是移动尾串。

## JAVA 实现

下面是 JAVA 实现的代码，可以处理相同字符串插入，子串的插入等情况

```java
/*
 * Name:   Double Array Trie
 * Author: Yaguang Ding
 * Mail: dingyaguang117@gmail.com
 * Blog: blog.csdn.net/dingyaguang117
 * Date:   2012/5/21
 * Note: a word ends may be either of these two case:
 * 1. Base[cur_p] == pos  ( pos<0 and Tail[-pos] == 'END_CHAR' )
 * 2. Check[Base[cur_p] + Code('END_CHAR')] ==  cur_p
 */

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

public class DoubleArrayTrie {
    final char END_CHAR = '';
    final int DEFAULT_LEN = 1024;
    int Base[]  = new int [DEFAULT_LEN];
    int Check[] = new int [DEFAULT_LEN];
    char Tail[] = new char [DEFAULT_LEN];
    int Pos = 1;
    Map<Character ,Integer> CharMap = new HashMap<Character,Integer>();
    ArrayList<Character> CharList = new ArrayList<Character>();

    public DoubleArrayTrie()
    {
        Base[1] = 1;

        CharMap.put(END_CHAR,1);
        CharList.add(END_CHAR);
        CharList.add(END_CHAR);
        for(int i=0;i<26;++i)
        {
            CharMap.put((char)('a'+i),CharMap.size()+1);
            CharList.add((char)('a'+i));
        }

    }
    private void Extend_Array()
    {
        Base = Arrays.copyOf(Base, Base.length*2);
        Check = Arrays.copyOf(Check, Check.length*2);
    }

    private void Extend_Tail()
    {
        Tail = Arrays.copyOf(Tail, Tail.length*2);
    }

    private int GetCharCode(char c)
    {
        if (!CharMap.containsKey(c))
        {
            CharMap.put(c,CharMap.size()+1);
            CharList.add(c);
        }
        return CharMap.get(c);
    }
    private int CopyToTailArray(String s,int p)
    {
        int _Pos = Pos;
        while(s.length()-p+1 > Tail.length-Pos)
        {
            Extend_Tail();
        }
        for(int i=p; i<s.length();++i)
        {
            Tail[_Pos] = s.charAt(i);
            _Pos++;
        }
        return _Pos;
    }

    private int x_check(Integer []set)
    {
        for(int i=1; ; ++i)
        {
            boolean flag = true;
            for(int j=0;j<set.length;++j)
            {
                int cur_p = i+set[j];
                if(cur_p>= Base.length) Extend_Array();
                if(Base[cur_p]!= 0 || Check[cur_p]!= 0)
                {
                    flag = false;
                    break;
                }
            }
            if (flag) return i;
        }
    }

    private ArrayList<Integer> GetChildList(int p)
    {
        ArrayList<Integer> ret = new ArrayList<Integer>();
        for(int i=1; i<=CharMap.size();++i)
        {
            if(Base[p]+i >= Check.length) break;
            if(Check[Base[p]+i] == p)
            {
                ret.add(i);
            }
        }
        return ret;
    }

    private boolean TailContainString(int start,String s2)
    {
        for(int i=0;i<s2.length();++i)
        {
            if(s2.charAt(i) != Tail[i+start]) return false;
        }

        return true;
    }
    private boolean TailMatchString(int start,String s2)
    {
        s2 += END_CHAR;
        for(int i=0;i<s2.length();++i)
        {
            if(s2.charAt(i) != Tail[i+start]) return false;
        }
        return true;
    }

    public void Insert(String s) throws Exception
    {
        s += END_CHAR;

        int pre_p = 1;
        int cur_p;
        for(int i=0; i<s.length(); ++i)
        {
            //获取状态位置
            cur_p = Base[pre_p]+GetCharCode(s.charAt(i));
            //如果长度超过现有，拓展数组
            if (cur_p >= Base.length) Extend_Array();

            //空闲状态
            if(Base[cur_p] == 0 && Check[cur_p] == 0)
            {
                Base[cur_p] = -Pos;
                Check[cur_p] = pre_p;
                Pos = CopyToTailArray(s,i+1);
                break;
            }else
            //已存在状态
            if(Base[cur_p] > 0 && Check[cur_p] == pre_p)
            {
                pre_p = cur_p;
                continue;
            }else
            //冲突 1：遇到 Base[cur_p]小于0的，即遇到一个被压缩存到Tail中的字符串
            if(Base[cur_p] < 0 && Check[cur_p] == pre_p)
            {
                int head = -Base[cur_p];

                if(s.charAt(i+1)== END_CHAR && Tail[head]==END_CHAR)    //插入重复字符串
                {
                    break;
                }

                //公共字母的情况，因为上一个判断已经排除了结束符，所以一定是2个都不是结束符
                if (Tail[head] == s.charAt(i+1))
                {
                    int avail_base = x_check(new Integer[]{GetCharCode(s.charAt(i+1))});
                    Base[cur_p] = avail_base;

                    Check[avail_base+GetCharCode(s.charAt(i+1))] = cur_p;
                    Base[avail_base+GetCharCode(s.charAt(i+1))] = -(head+1);
                    pre_p = cur_p;
                    continue;
                }
                else
                {
                    //2个字母不相同的情况，可能有一个为结束符
                    int avail_base ;
                    avail_base = x_check(new Integer[]{GetCharCode(s.charAt(i+1)),GetCharCode(Tail[head])});

                    Base[cur_p] = avail_base;

                    Check[avail_base+GetCharCode(Tail[head])] = cur_p;
                    Check[avail_base+GetCharCode(s.charAt(i+1))] = cur_p;

                    //Tail 为END_FLAG 的情况
                    if(Tail[head] == END_CHAR)
                        Base[avail_base+GetCharCode(Tail[head])] = 0;
                    else
                        Base[avail_base+GetCharCode(Tail[head])] = -(head+1);
                    if(s.charAt(i+1) == END_CHAR)
                        Base[avail_base+GetCharCode(s.charAt(i+1))] = 0;
                    else
                        Base[avail_base+GetCharCode(s.charAt(i+1))] = -Pos;

                    Pos = CopyToTailArray(s,i+2);
                    break;
                }
            }else
            //冲突2：当前结点已经被占用，需要调整pre的base
            if(Check[cur_p] != pre_p)
            {
                ArrayList<Integer> list1 = GetChildList(pre_p);
                int toBeAdjust;
                ArrayList<Integer> list = null;
                if(true)
                {
                    toBeAdjust = pre_p;
                    list = list1;
                }

                int origin_base = Base[toBeAdjust];
                list.add(GetCharCode(s.charAt(i)));
                int avail_base = x_check((Integer[])list.toArray(new Integer[list.size()]));
                list.remove(list.size()-1);

                Base[toBeAdjust] = avail_base;
                for(int j=0; j<list.size(); ++j)
                {
                    //BUG
                    int tmp1 = origin_base + list.get(j);
                    int tmp2 = avail_base + list.get(j);

                    Base[tmp2] = Base[tmp1];
                    Check[tmp2] = Check[tmp1];

                    //有后续
                    if(Base[tmp1] > 0)
                    {
                        ArrayList<Integer> subsequence = GetChildList(tmp1);
                        for(int k=0; k<subsequence.size(); ++k)
                        {
                            Check[Base[tmp1]+subsequence.get(k)] = tmp2;
                        }
                    }

                    Base[tmp1] = 0;
                    Check[tmp1] = 0;
                }

                //更新新的cur_p
                cur_p = Base[pre_p]+GetCharCode(s.charAt(i));

                if(s.charAt(i) == END_CHAR)
                    Base[cur_p] = 0;
                else
                    Base[cur_p] = -Pos;
                Check[cur_p] = pre_p;
                Pos = CopyToTailArray(s,i+1);
                break;
            }
        }
    }

    public boolean Exists(String word)
    {
        int pre_p = 1;
        int cur_p = 0;

        for(int i=0;i<word.length();++i)
        {
            cur_p = Base[pre_p]+GetCharCode(word.charAt(i));
            if(Check[cur_p] != pre_p) return false;
            if(Base[cur_p] < 0)
            {
                if(TailMatchString(-Base[cur_p],word.substring(i+1)))
                    return true;
                return false;
            }
            pre_p = cur_p;
        }
        if(Check[Base[cur_p]+GetCharCode(END_CHAR)] == cur_p)
            return true;
        return false;
    }

    //内部函数，返回匹配单词的最靠后的Base index，
    class FindStruct
    {
        int p;
        String prefix="";
    }
    private FindStruct Find(String word)
    {
        int pre_p = 1;
        int cur_p = 0;
        FindStruct fs = new FindStruct();
        for(int i=0;i<word.length();++i)
        {
            // BUG
            fs.prefix += word.charAt(i);
            cur_p = Base[pre_p]+GetCharCode(word.charAt(i));
            if(Check[cur_p] != pre_p)
            {
                fs.p = -1;
                return fs;
            }
            if(Base[cur_p] < 0)
            {
                if(TailContainString(-Base[cur_p],word.substring(i+1)))
                {
                    fs.p = cur_p;
                    return fs;
                }
                fs.p = -1;
                return fs;
            }
            pre_p = cur_p;
        }
        fs.p =  cur_p;
        return fs;
    }

    public ArrayList<String> GetAllChildWord(int index)
    {
        ArrayList<String> result = new ArrayList<String>();
        if(Base[index] == 0)
        {
            result.add("");
            return result;
        }
        if(Base[index] < 0)
        {
            String r="";
            for(int i=-Base[index];Tail[i]!=END_CHAR;++i)
            {
                r+= Tail[i];
            }
            result.add(r);
            return result;
        }
        for(int i=1;i<=CharMap.size();++i)
        {
            if(Check[Base[index]+i] == index)
            {
                for(String s:GetAllChildWord(Base[index]+i))
                {
                    result.add(CharList.get(i)+s);
                }
                //result.addAll(GetAllChildWord(Base[index]+i));
            }
        }
        return result;
    }

    public ArrayList<String> FindAllWords(String word)
    {
        ArrayList<String> result = new ArrayList<String>();
        String prefix = "";
        FindStruct fs = Find(word);
        int p = fs.p;
        if (p == -1) return result;
        if(Base[p]<0)
        {
            String r="";
            for(int i=-Base[p];Tail[i]!=END_CHAR;++i)
            {
                r+= Tail[i];
            }
            result.add(fs.prefix+r);
            return result;
        }

        if(Base[p] > 0)
        {
            ArrayList<String> r =  GetAllChildWord(p);
            for(int i=0;i<r.size();++i)
            {
                r.set(i, fs.prefix+r.get(i));
            }
            return r;
        }
        return result;
    }
}
```

测试

```java
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

import javax.xml.crypto.Data;

public class Main {

    public static void main(String[] args) throws Exception {
        ArrayList<String> words = new ArrayList<String>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream("E:/兔子的试验学习中心[课内]/ACM大赛/ACM第四届校赛/E命令提示/words3.dic")));
        String s;
        int num = 0;
        while((s=reader.readLine()) != null)
        {
            words.add(s);
            num ++;
        }
        DoubleArrayTrie dat = new DoubleArrayTrie();

        for(String word: words)
        {
            dat.Insert(word);
        }

        System.out.println(dat.Base.length);
        System.out.println(dat.Tail.length);

        Scanner sc = new Scanner(System.in);
        while(sc.hasNext())
        {
            String word = sc.next();
            System.out.println(dat.Exists(word));
            System.out.println(dat.FindAllWords(word));
        }
    }
}
```

下面是测试结果，构造 6W 英文单词的 DAT，大概需要 20 秒

我增长数组的时候是每次长度增加到 2 倍，初始 1024

Base 和 Check 数组的长度为 131072

Tail 的长度为 262144
