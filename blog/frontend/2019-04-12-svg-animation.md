---
layout: doc
title: "SVG 不规则圆形动画"
date: 2019-04-12 15:04:02 +0800
---

## 前言：

记得第一次听说 SVG 还是刚毕业时听同事说他们在网易的时候研究过 SVG，还以为是很古老的技术以为会被 canvas 淘汰呢

当年还是太年轻，SVG 作为一门描述性语言可能在有逻辑处理的需求中力不从心，但是有这毕竟是极少的需求，在大多数情况下 SVG 的丰富的表意已经完全可以满足我们的需求。

本文记录了使用 SVG 实现一个动画需求的过程，希望可以帮助大家了解到 SVG 的一些作用

## 一、需求

最终的效果是这样一个形状不规则，并且随着时间连续变化的圆形的动画

![](/blog/assets/img/2019-04-12-svg-0.gif)

## 二、分析

**想法 1：**

这个似乎可以定义一个函数 R = f(A) 即半径 R 随着角度 A 变化。那么这个函数满足

```json
1. 连续
2. f(0) = f(2π)
3. 高阶可导（有足够的平滑度，不能画出来的像刺猬）
```

如果我们找到这样一个函数，就可以生成这样一个不规则的原形了，哈哈似乎目标很明确了

等等，如果我们希望这个圆形扭动起来，那么这个函数得是 R = f(A,t) 即半径 R 随着角度 A 和时间 t 变化，并且依然是连续的。这时冥冥之中仿佛看到了数学老师轻蔑的眼神。是的，我的数学知识不允许我再继续任性下去了。

**想法 2：**

这个图形是一个封闭曲线填充构成的，提到封闭曲线，就自然会想到贝塞尔曲线（一个法国车企的工程师发明的）。简单来说，贝塞尔曲线就是由节点练成的曲线，每两个节点之间通过 1 个或多个控制点来控制曲线的变化。

那我们这个圆形用贝塞尔曲线画应该怎么画呢，这里使用 Sketch 来画一下：

![](/blog/assets/img/2019-04-12-svg-2.png)

到这里我们的思路就明朗起来了，只要定义好这样的路径，然后随机对路径上的节点和控制节点进行微调，就可以实现不规则圆形。

需要这个圆形动起来，也很简单了，只需要按照时间改变节点和控制节点的位置即可。

## 三、技术调研

- SVG 基础：SVG 中对贝塞尔曲线的支持，是通过 Path 标签实现的，MDN 这篇文章比较详细地介绍了 SVG 的 Path
  [SVG Path 基础](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths)

- JS 的 SVG 框架：生成 SVG 代码的方式有很多种，比如直接使用设计软件如 Sketch、 AI。但是我们需要 SVG 可以动起来，并且有一定的逻辑在里面，所以我选择使用 JS 生成和操作 SVG。我选择的是 [SnapSVG](https://snapsvg.io) 这个框架。

## 四、动手实现

我们首先尝试生成一个节点均匀分布路径：

```js
function Node(center, angle, radius) {
  /*
   * 计算每个节点的坐标和2个控制点的坐标
   * 取控制节点距离为 1/4 半径
   */
  let PI_2 = Math.PI / 2;

  var dx = radius * Math.cos(angle);
  var dy = radius * Math.sin(angle);
  var node = [center[0] + dx, center[1] + dy];
  var contoller_radius = radius / 4;

  dx = contoller_radius * Math.cos(angle - PI_2);
  dy = contoller_radius * Math.sin(angle - PI_2);
  var controller1 = [node[0] + dx, node[1] + dy];

  dx = contoller_radius * Math.cos(angle + PI_2);
  dy = contoller_radius * Math.sin(angle + PI_2);
  var controller2 = [node[0] + dx, node[1] + dy];

  return {
    node: node,
    controller1: controller1,
    controller2: controller2,
  };
}

function generateNodes(width, node_count, radius) {
  // calc
  var angle = (Math.PI * 2) / node_count;
  var center = [width / 2, width / 2];
  var nodes = [];
  for (var i = 0; i < node_count; ++i) {
    nodes.push(new Node(center, angle * i, radius));
  }
  document.querySelector("#output").append(nodes);
  return nodes;
}

function debugNodes(selector, nodes) {
  var s = Snap(selector);
  var d = `M ${nodes[0].node[0]} ${nodes[0].node[1]} `;
  for (i = 0; i < nodes.length; ++i) {
    var node = nodes[(i + 1) % nodes.length];
    d += `L ${node.node[0]} ${node.node[1]} `;
    s.line(node.controller1[0], node.controller1[1], node.controller2[0], node.controller2[1]).attr({
      stroke: "#f82653",
      strokeWidth: 1,
    });
  }
  s.path(d).attr({ fill: "#cccccc", stroke: "#339ce1", strokeWidth: 2 });
}

function generateSVG(selector, nodes) {
  /* 根据所有节点以及控制点生成三次贝塞尔曲线
   * 首先 M到第一个节点，然后依次 按照 "C 当前节点的控制节点2 下个节点的控制节点1 下个节点"
   * 参数 生成 Path 的路径
   */
  var s = Snap(selector);
  var d = `M ${nodes[0].node[0]} ${nodes[0].node[1]} `;
  for (i = 0; i < nodes.length; ++i) {
    var node1 = nodes[i];
    var node2 = nodes[(i + 1) % nodes.length];
    d += `C ${node1.controller2[0]} ${node1.controller2[1]} ${node2.controller1[0]} ${node2.controller1[1]} ${node2.node[0]} ${node2.node[1]} `;
  }
  s.path(d).attr({ fill: "#339ce1", stroke: "#339ce1", strokeWidth: 2 });
  return s;
}

var nodes = generateNodes(200, 7, 100);
debugNodes("#debug", nodes);
generateSVG("#svg", nodes);
```

[代码+在线 Demo](https://jsfiddle.net/4vL279ar/25/)

如图所示，这是一个 7 个节点的 Path 参数示意图 和实际生成的贝塞尔曲线路径

![](/blog/assets/img/2019-04-12-svg-3.png)

好了基本的形状有了，要生成随机的不规则圆形，我们通过随机变换节点的位置以及控制节点的位置来实现。 修改如下：

```js
function Node(center, angle, radius, random_adjust, controller_scale) {
  /*
   * 计算每个节点的坐标和2个控制点的坐标
   * random_adjust 随机范围， 一般在 0-0.2
   * controller_scale 控制节点长度和半径的比例，这个参数控制曲线平滑度
   */
  let PI_2 = Math.PI / 2;

  var dx = radius * (1 + Math.random() * random_adjust) * Math.cos(angle);
  var dy = radius * (1 + Math.random() * random_adjust) * Math.sin(angle);
  var node = [center[0] + dx, center[1] + dy];
  var contoller_radius = radius * controller_scale;

  dx = contoller_radius * Math.cos(angle - PI_2);
  dy = contoller_radius * Math.sin(angle - PI_2);
  var controller1 = [node[0] + dx, node[1] + dy];

  dx = contoller_radius * Math.cos(angle + PI_2);
  dy = contoller_radius * Math.sin(angle + PI_2);
  var controller2 = [node[0] + dx, node[1] + dy];

  return {
    node: node,
    controller1: controller1,
    controller2: controller2,
  };
}
```

看看效果如何

![](/blog/assets/img/2019-04-12-svg-4.png)

任务基本上完成了大半，剩下的就是让这个圆形动起来， 这个反而是最简单的一步了，使用 snapsvg 的 animate 方法既可以自动创建补间动画，只要生成新的 Path 路径，就可以按照 d 属性动起来了

```js
function animate() {
  let d = generatePath(generateNodes(300, 7, 100, 0.2, 0.3));
  circle.animate({ d: d }, 2000, null, animate);
}

animate();
```

效果如图所示：

![最终效果](/blog/assets/img/2019-04-12-svg-5.gif)

大功告成！

[完整代码](https://jsfiddle.net/dingyaguang117/tsw2zv3k/16)
