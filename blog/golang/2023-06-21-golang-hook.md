---
layout: doc
title: "Golang 实现 Hook"
date: 2023-06-21 00:00:00 +0800
category: "Golang"
---

## Hook?

Hook(钩子) 的一种实现方式是像洋葱一样，一层层的将目标函数包在里面，可以在执行前、执行后分别执行某些操作。形式类似于 Python 中的 [contextmanager](https://python3-cookbook.readthedocs.io/zh_CN/latest/c09/p22_define_context_managers_the_easy_way.html)。

为了实现这种效果，可以利用函数闭包来轻松实现，下面我们就尝试在 Golang 中实现 Hook 功能.

## 一、手动 hook

```go
package hooker

import (
	"fmt"
)

// 原始函数原型
type Func func(a, b int) int

// 原始函数定义
func SomeFunc(a, b int) int {
	fmt.Printf("%d + %d\n", a, b)
	return a + b
}

// Hook
func Hook1(f Func) Func {
	return func(a, b int) int {
		fmt.Println("----- before ----")
		c := f(a, b)
		fmt.Println("----- after ----")
		return c
	}
}
```

```go
package hooker

import (
	"testing"
)

func TestHookFunc(t *testing.T) {
	var func1 = Hook1(SomeFunc)
	func1(1, 2)
}
```

输出结果:

```go
----- before ----
1 + 2
----- after ----
```

可以看出来，本质就是用一个将新的代码包裹在原始函数外面，并返回相同签名的函数（套娃 🪆）。

## 二、定义 hook

下面我们将 Hook 的形式抽取定义出来：传入一个函数并返回一个签名相同的函数。

```go
type Hook func(Func) Func
```

## 三、将 Hook 操作封装起来

因为在对于使用者来说，将 Hook 函数手动一层层包裹起来，还是不太友好，下面我们尝试将这个稍显复杂的操作封装起来。用户就不再需要手动进行 Wrap 操作了。

```go
package hooker

import (
	"fmt"
)

// 原始函数原型
type Func func(a, b int) int

// Hook 原型
type Hook func(Func) Func


// 将 Hook 操作封装起来
type Hooker struct {
	origin  Func   // 原始函数
	wrapped Func   // 包装后的函数
	hooks   []Hook // 钩子函数列表
}

func NewHooker(origin Func, hooks ...Hook) *Hooker {
	h := &Hooker{
		origin: origin,
		hooks:  hooks,
	}
	wrapped := origin
	for _, hook := range h.hooks {
		wrapped = hook(wrapped)
	}
	h.wrapped = wrapped
	return h
}

func (h *Hooker) Run(a, b int) int {
	return h.wrapped(a, b)
}

```

与此同时我们将使用者相关的代码分离出来，

```go
// 原始函数定义
func SomeFunc(a, b int) int {
	fmt.Printf("%d + %d\n", a, b)
	return a + b
}

// Hook
var Hook1 Hook = func(f Func) Func {
	return func(a, b int) int {
		fmt.Println("----- before ----")
		c := f(a, b)
		fmt.Println("----- after ----")
		return c
	}
}

func TestHookFunc(t *testing.T) {
	hooker := NewHooker(SomeFunc, Hook1, Hook1)
	hooker.Run(1, 2)
}

```

输出

```
----- before ----
----- before ----
1 + 2
----- after ----
----- after ----
```

## 四、使用泛型改造 Hooker

```go
package hooker

// Hook 原型
type Hook[Func any] func(Func) Func

// Hooker 将 Hook 操作封装起来
type Hooker[Func any] struct {
	origin  Func         // 原始函数
	wrapped Func         // 包装后的函数
	hooks   []Hook[Func] // 钩子函数列表
}

func NewHooker[Func any](origin Func, hooks ...Hook[Func]) *Hooker[Func] {
	h := &Hooker[Func]{
		origin: origin,
		hooks:  hooks,
	}
	wrapped := origin
	for _, hook := range h.hooks {
		wrapped = hook(wrapped)
	}
	h.wrapped = wrapped
	return h
}

// 因为 Func 可以为任意函数，函数签名不同，这里无法使用再使用同一个通用的 Run 来表示，因此我们只能通过返回 Wrapped 函数，让使用者自己去调用
//func (h *Hooker[Func]) Run(a, b int) int {
//	return h.wrapped(a, b)
//}

func (h *Hooker[Func]) GetWrappedFunc() Func {
	return h.wrapped
}

```

使用代码:

```go
package hooker

import (
	"fmt"
	"testing"
)

// Func 原始函数原型
type Func func(a, b int) int

// SomeFunc 原始函数定义
func SomeFunc(a, b int) int {
	fmt.Printf("%d + %d\n", a, b)
	return a + b
}

// Hook1 Hook
var Hook1 Hook[Func] = func(f Func) Func {
	return func(a, b int) int {
		fmt.Println("----- before ----")
		c := f(a, b)
		fmt.Println("----- after ----")
		return c
	}
}

func TestHookFunc(t *testing.T) {
	hooker := NewHooker[Func](SomeFunc, Hook1, Hook1)
	hooker.GetWrappedFunc()(1, 2)
}
```

## 五、总结

至此我们一步一步实现了 Hook，并且通过泛型的特性将其简单封装。

完整代码: [https://github.com/dingyaguang117/go-hooker](https://github.com/dingyaguang117/go-hooker)
