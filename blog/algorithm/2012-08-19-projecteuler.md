---
layout: doc
title: "ProjectEuler,1-10 题"
date: 2012-08-19 15:04:02 +0800
category: "算法&数据结构"
---

先介绍一下，ProjectEuler，欧拉工程，是一个国外的练习数论的网站，总共 300 多道题目。
网址是 [http://projecteuler.net/problems](http://projecteuler.net/problems) ，有个特点是可以使用任何编程语言，或者自己手算，得到答案提交就可以了。
这个和 OJ 是不一样的。提交通过以后，可以去论坛看看那别人的解决方法，以及参与讨论。

好久没有动手做题了，那天看到论坛又有人在说，就来做做。我使用的语言是 python，Life is short，you need Python

前面的题目很基础，但是刷水体不是我的风格，所以我尽量用高效的，不一样的的方法来解决。

### 1. Add all the natural numbers below one thousand that

are multiples of 3 or 5.

没什么特别的，用容斥就可以了

```python
def main():
    MAX = 999
    print 3 * (MAX/3)*(MAX/3+1) /2 + 5 * (MAX/5)*(MAX/5+1) /2  - 15 * (MAX/15)*(MAX/15+1) /2
if __name__ == '__main__':
    main()
```

### 2. By considering the terms in the Fibonacci sequence whose values do not exceed four million, find the sum of the even-valued terms.

这一题是寻找一个小于 4000000 的最大的那个 fibonacci 数，
答案很小，朴素方法几行就写完了，但是我还是选择用高级方法
我们可以用矩阵快速幂乘来以 O(logN)的时间获得第 N 个 fibonacci 数，然后我们选定范围二分答案就可以了

```python
#|Fn+1| = |1 1| * |Fn  |
#|Fn  |   |1 0|   |Fn-1|
#
#|Fn+1| = (|1 1|)**n * |F1|
#|Fn  |   (|1 0|)      |F0|
class matrix:
    def __init__(self,data):
        self.data = data
    def multiple(self, m2):
        N = len(self.data)
        if isinstance(m2,matrix):
            m2 = m2.data
        new = []
        for i in range(N):
            new.append([0]*N)
        for i in range(N):
            for j in range(N):
                for k in range(N):
                    new[i][j] += self.data[i][k]*m2[k][j]
        return matrix(new)
    def __str__(self):
        return str(self.data)
    def __repr__(self):
        return str(self.data)
class Fibonacci():
    def __init__(self,N):
        fac = matrix([[1,1],[1,0]])
        self.base = []
        for i in range (N-1):
            self.base.append(fac)
            fac = fac.multiple(fac)
    def get(self,N):
        i = 0
        a = matrix([[1,0],[0,1]])
        while N > 0:
            if N&1 > 0:
                a = a.multiple(self.base[i])
            N >>= 1
            i+=1
        return a.data[1][0]+a.data[1][1]
def bs_ans(low, high,limit):
    f = Fibonacci(10)
    ans = 0
    ans_p = 0
    while low <= high:
        v = f.get((low+high)>>1)
        if v > limit:
            high = (low+high)/2-1
        else:
            ans = v
            ans_p = (low+high)/2
            low = (low+high)/2 + 1
    return ans_p,ans
def main():
    p,limit =  bs_ans(1,50,4000000)
    while True:
        if (p + 1) % 3 == 0:
            break
        p -= 1
    f = Fibonacci(10)
    print (f.get(p+2)-1)/2
if __name__ == '__main__':
    main()
```

### 3. Find the largest prime factor of a composite number.

寻找一个数的最大的质因子，直接分解质因数就可以了。数量比较小，用的最基础的分解质因数的方法，有兴趣的同学可以看看

```python
import math
def PrimeList(N = None,limit = None):
    if N ==None and limit ==None:
        raise Exception('need either N or limit')
    ans = [2,3]
    i = 5
    dt = 2
    while True:
        if N != None and len(ans) >= N : break
        if limit != None and ans[-1] >= limit: break
        f = True
        for j in ans:
            if i%j == 0:
                f = False
                break
        if f:
            ans.append(i)
        i += dt
        dt = 6 - dt
    return ans
def IntegerFactorization(N):
    pass
def main():
    N = 600851475143
    a = math.sqrt(N)
    print a
    plist = PrimeList(limit=a)[::-1]
    for p in plist:
        if N % p == 0:
            print p
            break
if __name__ == '__main__':
    main()
```

### 4. Find the largest palindrome made from the product of two 3-digit numbers.

没想到什么好方法，暴力的

```python
def main():
    ans = 0
    for i in xrange(100,1000):
        for j in xrange(100,1000):
            v = i * j
            d = str(v)
            e=d[::-1]
            if d == e:
                if v > ans:
                    ans = v
    print ans
if __name__ == '__main__':
    main()
```

### 5. What is the smallest number divisible by each of the

numbers 1 to 20?

典型的最小公倍数，N 个数的最小公倍数，等于 LCM(A1,LCM(A2,A3,…An-1))

```python
def GCD(L):
    if len(L) > 2:
        return GCD([L[0], GCD(L[1:])])
    a = max(L)
    b = min(L)
    while a % b != 0:
        t = b
        b = a % b
        a = t
    return b
def LCM(L):
    if len(L) > 2:
        return LCM([L[0],LCM(L[1:])])
    return L[0] * L[1] / GCD(L)
print GCD(range(1,21))
print LCM(range(1,21))
```

### 6. What is the difference between the sum of the squares and the square of the sums?

好吧大整数的题目（python 完全没有感觉…），暴力的

```python
print sum(range(101))**2 - sum([x**2 for x in range(101)])
```

### 7. Find the 10001st prime.

找第几个质数，因为数量稍大了，所以用了填充法筛质数，比较常用的方法

```python
def PrimeList(N = None,limit = None):
    if N ==None and limit ==None:
        raise Exception('need either N or limit')
    ans = [2,3]
    i = 5
    dt = 2
    while True:
        if N != None and len(ans) >= N : break
        if limit != None and ans[-1] >= limit: break
        f = True
        for j in ans:
            if i%j == 0:
                f = False
                break
        if f:
            ans.append(i)
        i += dt
        dt = 6 - dt
    return ans
def IntegerFactorization(N):
    pass
print PrimeList(10001)[-1]
```

### 8. Discover the largest product of five consecutive digits in the 1000-digit number.

这题可以注意到如果序列中有 0，就全为 0 了。所以我们可以用 0，分割序列，然后每个序列如果长度少于 5 就可以直接 skip
剩下的每个子序列单独暴力就 ok 了。

```python
def calc(L,N):
    m = 0
    for i in xrange(len(L)-N+1):
        ans = reduce(lambda m,n:m*n,L[i:i+N])
        if ans >m:
            m = ans
    return m
def main():
    s = '''
    73167176531330624919225119674426574742355349194934
    96983520312774506326239578318016984801869478851843
    85861560789112949495459501737958331952853208805511
    12540698747158523863050715693290963295227443043557
    66896648950445244523161731856403098711121722383113
    62229893423380308135336276614282806444486645238749
    30358907296290491560440772390713810515859307960866
    70172427121883998797908792274921901699720888093776
    65727333001053367881220235421809751254540594752243
    52584907711670556013604839586446706324415722155397
    53697817977846174064955149290862569321978468622482
    83972241375657056057490261407972968652414535100474
    82166370484403199890008895243450658541227588666881
    16427171479924442928230863465674813919123162824586
    17866458359124566529476545682848912883142607690042
    24219022671055626321111109370544217506941658960408
    07198403850962455444362981230987879927244284909188
    84580156166097919133875499200524063689912560717606
    05886116467109405077541002256983155200055935729725
    71636269561882670428252483600823257530420752963450
    '''
    s = [map(int,list(s)) for s in [subs for subs in ''.join(s.split()).split('0') if len(subs) > 4]]
    ans = 0
    for l in s:
        r = calc(l,5)
        if r > ans:
            ans = r
    print ans
if __name__ == '__main__':
    main()
```

### 9. Find the only Pythagorean triplet, {a, b, c}, for which a + b + c = 1000.

算了半天，还是暴力的

```python
def main():
    for a in xrange(1,1001):
        b = a
        while a*a + b*b <= (1000-a-b)**2:
            if a*a + b*b == (1000-a-b)**2:
                print a,b,1000-a-b
                print a*b*(1000-a-b)
            b += 1
if __name__ == '__main__':
    main()
```

### 10. Calculate the sum of all the primes below two million.

又是质数打表，直接 copy 代码 ok

```python
import math
def PrimeList(N = None,limit = None):
    '''
        return first N primes or  primes <= limit
    '''
    if N ==None and limit ==None:
        raise Exception('need either N or limit')
    ans = [2,3]
    i = 5
    dt = 2
    while True:
        if N != None and len(ans) >= N : break
        if limit != None and ans[-1] >= limit: break
        f = True
        for j in ans:
            if i%j == 0:
                f = False
                break
        if f:
            ans.append(i)
        i += dt
        dt = 6 - dt
    return ans
def PrimeListFill(limit):
    '''
        return primes <= limit
    '''
    A = [True] * (limit + 1)
    plist = PrimeList(limit=int(math.sqrt(limit)))
    for p in plist:
        n = 2 * p
        while n <= limit:
            A[n] = False
            n += p
    ans = []
    for i in xrange(2,len(A)):
        if A[i]:
            ans.append(i)
    return ans
def main():
    L = PrimeListFill(2000000)
    print sum(L)
if __name__ == '__main__':
    main()
```
