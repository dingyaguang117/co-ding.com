---
layout: doc
title: "旅行商问题的动态规划解决"
date: 2012-11-24 15:04:02 +0800
category: "算法&数据结构"
---

旅行商问题是一个著名的 NP 问题，不能找到多项式解。不过可以用动态规划的方法把时间复杂度从 O(N!)降低到 O(2^N)。对于解决小规模的旅行商还是可以实现的。

题目地址在这里：http://icpc.ahu.edu.cn/OJ/Problem.aspx?id=420

发现枚举过程中还是有很多重复计算的，所以可以存贮一下状态，避免了重复计算。

开辟 N+1 维数组，`dp[N][2][2]..[2]`，其中 `dp[cur][p1][p2]..[pn]` 表示，当前人在 cur 位置,并且 p1--pn 走过的为 1，未走过的为 0。可见空间复杂度为 N\*2^N。

状态转移方程为

```bash
dp[cur][p1]..[1]..[pn] = min{dp[i][p1]..[0]..[n]+Dis[cur][i]}
```

其中 i 为 1--N 地点中已经走过的地点。

因为当前状态只能从已经走过的那些地方走过来，所以只要选一个最短的，就表示走完以上地点，并且停在当前点需要的最短路程就是这么多。由于回路必然包含每一个点，所以从任何点出发，得到的最短路径都是一定的。所以我的程序假设就从第一个点出发。
边界条件就是 dp[0][1]。dp[0][1]=0，表示在第 0 个地点(我是用 0--N-1 表示 N 个地点的)，1 的二进制是 00000001，表示只有第一个可以走过。

要注意:既然假设从第一个地点出发，所以在递归自顶向下搜索的时候，只有最后一次才能回出发点！即 `dp[cur][p1]..[1]..[pn]` 中，在 p1--pn 中只有 2 个为 1 的时候，也就是只有出发点和第二个地点的时候，才能从第二个地点回到出发点。最终的结果只要取 `min{dp[i][1]..[1]..[1]+Dis[0][i]}` 就好了，表示回到出发点 0。构成完整回路。

当然如果 N 比较大，开那么多维的数组比较麻烦，而且可能编译不能通过。所以我们用一个数的不同位分别表示一个城市是否走过。于是将 N 维压缩到一维。`dp[N][2]..[2]` 变成了 `dp[N][2^N]`。

```cpp
#include <iostream>
using namespace std;
int N;              //total num of place
int Map[16][16];
int dp[16][36768];  //dp[cur][status] cur:0--N-1 当前所在位
                    //status 第i位 表示当前是否走过
int num_of_1(int status)        //获取多少位为1，表示已经走过多少地点
{
    int i,sum=0;
    int t=1;
    for(i=0;i<N;++i)
    {
        if(status&t)
        {
            ++sum;
        }
        t<<=1;
    }
    return sum;
}
int get(int cur,int status)
{
    if(dp[cur][status]!=-1)
    {
        return dp[cur][status];
    }
    if (num_of_1(status)>2)     //除了出发点，还有其他地方可以走
    {
        int i,t=2;
        int minlen=10000000;
        for (i=1;i<N;++i,t<<=1)
        {
            if (i==cur)
            {
                continue;
            }
            if (status & t)
            {
                if (get(i,status & (~(1<<cur)))+Map[cur][i] < minlen)       //去掉当前位
                {
                    minlen=get(i,status & (~(1<<cur)))+Map[cur][i];
                }
            }
        }
        return dp[cur][status]=minlen;
    }else                       //只能回到出发点
    {
        return dp[cur][status]=Map[0][cur];
    }
}
int main()
{
    int i,j,minlen;
    cin>>N;
    if (N==1)
    {
        cout<<0<<endl;
        return 0;
    }
    for(i=0;i<N;++i)
    {
        for(j=0;j<N;++j)
        {
            cin>>Map[i][j];
        }
    }
    for (i=0;i<N;++i)
    {
        for (j=0;j<32768;++j)
        {
            dp[i][j]=-1;
        }
    }
    dp[0][1]=0;     //处在第一个点，即出发点
    minlen=10000000;
    for (i=1;i<N;++i)
    {
        if (Map[0][i]+get(i,(1<<N)-1)<minlen)
        {
            minlen=Map[0][i]+get(i,(1<<N)-1);
        }
    }
    cout<<minlen<<endl;
}
```
