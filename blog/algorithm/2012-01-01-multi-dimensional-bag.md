---
layout: doc
title: Project Euler 201 - 多维背包
lang: en-US
date: 2012-03-04 00:00:00 +0800
category: "算法&数据结构"
---

原题：[http://projecteuler.net/problem=201](http://projecteuler.net/problem=201)

## 题目

寻找 100 个数里面，50 大小的子集的，所有和唯一的子集的和。

## 分析

比普通背包多了一个子集数。

没计算最大可能的数是多大，直接用了 python 的字典表示“和" 的那个维度,
当然可以用滚动数组，或者临时变量啥的来减少一个维度，不过我直接每处理一行之后把上一行 del，
这样可以简单些。。。

## 代码

```python
def main():
	#define
	N = 100
	K = 50
	num = [a*a for a in range(1, N+1)]
	#initial
	dp=[]
	for i in range(N+1):
		t = []
		for j in range(N+1):
			t.append({})
		dp.append(t)
	dp[1][0] = {0: 1}
	dp[1][1] = {num[0]: 1}
	#dp
	for i in range(2, N+1):
		for j in range(0, i+1):
			if N-i+j < K:
				continue
			if j > K:
				break
			dp[i][j] = dp[i-1][j].copy()
			for key in dp[i-1][j-1]:
				if key+num[i-1] not in dp[i][j]:
					dp[i][j][key+num[i-1]] = dp[i-1][j-1][key]
				else:
					dp[i][j][key+num[i-1]] += dp[i-1][j-1][key]
		tmp = dp[i-1]
		dp[i-1] = {}
		del tmp
	#outputs
	print sum(key for key in dp[N][K] if dp[N][K][key] == 1)

if __name__ == '__main__':
	main()
```
