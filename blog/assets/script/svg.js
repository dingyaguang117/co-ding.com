function Node(center, angle, radius, random_adjust, controller_scale) {
	/*
  * 计算每个节点的坐标和2个控制点的坐标
  * random_adjust 随机范围， 一般在 0-0.2
  * controller_scale 控制节点长度和半径的比例，这个参数控制曲线平滑度
  */
  let PI_2 = Math.PI / 2

	var dx = radius * (1 + Math.random() * random_adjust) * Math.cos(angle)
  var dy = radius * (1 + Math.random() * random_adjust) * Math.sin(angle)
  var node = [center[0] + dx, center[1] + dy]
  var contoller_radius = radius * controller_scale
  
  dx = contoller_radius * Math.cos(angle - PI_2)
  dy = contoller_radius * Math.sin(angle - PI_2)
  var controller1 = [node[0] + dx, node[1] + dy]
  
  dx = contoller_radius * Math.cos(angle + PI_2)
  dy = contoller_radius * Math.sin(angle + PI_2)
  var controller2 = [node[0] + dx, node[1] + dy]
  
  return {
    node: node,
    controller1: controller1,
    controller2: controller2
  }
}

function generateNodes(width, node_count, radius, random_adjust, controller_scale){
	/*
  * width 总宽度
  * node_count 节点数
  * radius 基本半径
  * random_adjust 节点坐标随机范围， 一般在 0-0.2
  * controller_scale 控制节点长度和半径的比例，这个参数控制曲线平滑度
  */
  // calc
  var angle = Math.PI * 2 / node_count
  var center = [width / 2, width / 2]
  var nodes = []
  for (var i = 0; i < node_count; ++i) {
    nodes.push(new Node(center, angle * i, radius, random_adjust, controller_scale))
  }
  return nodes
}

function debugNodes(selector, nodes) {
  var s = Snap(selector);
  var d = `M ${nodes[0].node[0]} ${nodes[0].node[1]} `
  var g = s.g()
  for(i = 0; i < nodes.length; ++i) {
    var node = nodes[(i + 1) % nodes.length]
    d += `L ${node.node[0]} ${node.node[1]} `
    var l = s.line(node.controller1[0], node.controller1[1], node.controller2[0], node.controller2[1]).attr({stroke: "#f82653",strokeWidth: 1 });
    g.add(l)
  }
  g.add(s.path(d).attr({fill: "#cccccc", stroke: "#339ce1", strokeWidth: 2}));
  return g
}

function generatePath(nodes) {
	var d = `M ${nodes[0].node[0]} ${nodes[0].node[1]} `
  for(i = 0; i < nodes.length; ++i) {
    var node1 = nodes[i]
    var node2 = nodes[(i + 1) % nodes.length]
    d += `C ${node1.controller2[0]} ${node1.controller2[1]} ${node2.controller1[0]} ${node2.controller1[1]} ${node2.node[0]} ${node2.node[1]} `
  }
  return d;
}

function generateCircle(selector, nodes) {
	/* 根据所有节点以及控制点生成三次贝塞尔曲线
  * 首先 M到第一个节点，然后依次 按照 "C 当前节点的控制节点2 下个节点的控制节点1 下个节点"
  * 参数 生成 Path 的路径
  */
  var s = Snap(selector);
  var d = generatePath(nodes)
  var path = s.path(d).attr({fill: "#339ce1",stroke: "#339ce1",strokeWidth: 2});
  return path
}

var nodes = generateNodes(300, 7, 100, 0.2, 0.3)
var debug = debugNodes("#debug", nodes)
var circle = generateCircle("#svg", nodes)

function animate() {
	var nodes2 = generateNodes(300, 7, 100, 0.2, 0.3)
  let d = generatePath(nodes2)
  debug.remove()
	debug = debugNodes("#debug", nodes2)
  circle.animate({d: d}, 2000, null, animate)
}

animate()
