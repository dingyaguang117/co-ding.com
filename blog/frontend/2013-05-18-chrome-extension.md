---
layout: doc
title: "Chrome 浏览器插件编程入门"
date: 2013-05-18 15:04:02 +0800
---

其实在高中毕业那会儿就有想编写浏览器插件的念头，主要是当时玩一个网页游戏很辛苦，想写个外挂练级。后来找到一些外挂，有一个很牛，独立程序，不知道通过什么手段可以获取打开的 web 页面的数据(解析后)，然后应该是通过给浏览器发送消息完成一些任务。当时一直想了解下，不过问了很多人也没人知道具体是怎么实现的。

去年，不知道怎么看到关于 chrome 插件文章，知道了 chrome 的插件是纯 js 编写的（firefox 应该也是）。正好前段时间有个朋友问我有没有办法监控 twitter，因为 nike 官网会定时发布一些限量的鞋子，所以。。。

我想了想还是用写浏览器插件最方便，于是开始翻阅资料开始弄这个东西。官方文档在这里：[http://developer.chrome.com/extensions/index.html](http://developer.chrome.com/extensions/index.html)

看完上面的东西呢，大概可以了解到整个 chrome 插件的结构。主要就是 background.htm 和 content.js 两个大部分。前者是执行插件的主要功能，里面可以包含 js 来完成插件的主要控制逻辑。后者呢是注入到当前页面的一个脚本，用来检测和操作当前页面的 dom 元素。manifest.json 是配置文件，定义了 background page，content scripts，哪些页面执行插件，图标等等。

我的插件功能是：监控 twitter 页面，如果发现新的推文，并且是限量版鞋子的发布,就自动跳转到推文中给的链接，然后自动选择尺码并提交表单。

具体流程是：background.js 不断发送消息给 content script，让 content script 检测是否有新的推文更新并检测是不是新品发布。如果是的话 response 给 background.js，background.js 会 update tab 的 url 属性，进行跳转，当页面加载完成之后，再通知 content script 进行表单填写和提交。

下面是代码清单：
manifest.json:

```json
{
  "name": "NikeStore Twitter Helper",
  "manifest_version": 2,
  "version": "0.1",
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
    {
      "matches": ["http://twitter.com/*", "https://twitter.com/*", "http://store.nike.com/*"],
      "css": ["mystyles.css"],
      "js": ["jquery-1.9.0.js", "NikeStore.js"]
    }
  ],
  "permissions": ["tabs", "http://*/*", "https://*/*"],
  "browser_action": {
    "name": "Click to change the icon's color",
    "default_title": "title....",
    "default_badge": "badg",
    "default_icon": "image/nike2.png"
  }
}
```

我这里 background 没有定义 page 属性，之定义了 scripts，chrome 会自动生成一个默认的“\_generated_background_page.html”
注意到 content_sripts 下面有 matches 属性，定义了匹配成功哪些 pattern 的网站才执行脚本。

background.js：

```js
var isRun = false;
var timer;

function RunStop() {
  isRun = !isRun;
  if (isRun) {
    chrome.browserAction.setIcon({ path: "image/nike.png" });
    timer = setInterval(checkAvalible, 1000);
  } else {
    chrome.browserAction.setIcon({ path: "image/nike2.png" });
    clearInterval(timer);
  }
}

function checkAvalible() {
  console.log("checkAvalible");
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendRequest(tab.id, { type: "checkAvalible" }, function (response) {
      //console.log(response.data);
      var url = response.data;
      chrome.tabs.update(tab.id, { url: url }, watchNikeStore);
    });
  });
}

function watchNikeStore(tab) {
  //停止刷新监测
  RunStop();
  //开始监控 nike store 加载完成
  chrome.tabs.onUpdated.addListener(SubmitCart);
  console.log(tab.url);
  console.log("SubmitCarted!!!!");
}

function SubmitCart(tabId, changeInfo, tab) {
  console.log("tab updated:" + tab.url);
  console.log(changeInfo);
  if (changeInfo.status != "complete" || tab.url.indexOf("http://store.nike.com") == -1) {
    return;
  }
  chrome.tabs.sendRequest(tabId, { type: "SubmitCart" });
}

chrome.browserAction.onClicked.addListener(RunStop);
```

注意到这里使用了 chrome.browserAction 来控制插件的按钮。以及使用 chrome.tabs.sendRequest 来与 content_script 进行通讯。
因为 background 的脚本是无法直接操作 tab 里面的 dom 元素的，所以需要通过通讯的方式来远程调用 content_script 里面的函数进行 dom 操作。
稍后的 content script 代码里面将演示如何接受 request。这里还有用到了监控 tab update 事件，通过 chrome.tabs.onUpdated.addListener 添加回调，可以知道当前页面的 url 变化了。chrome.tabs.update 可以改变 tab 的属性，我在这里更新 url，即进行了一次页面跳转。

NikeStore.js:

```js
var isRun = false;

//处理twitter页面

function checkAvalible(request, sender, sendResponse) {
  //alert($($(".js-tweet-text")[0]).text());
  var statuses = $("#stream-items-id .content");
  for (var i = 0; i < statuses.length; ++i) {
    var time = $($(statuses[i]).find("._timestamp")[0]).attr("data-time");
    var status = $($(statuses[i]).find(".js-tweet-text")[0]);
    var time2 = new Date(parseInt(time) * 1000);
    //alert(status.text() +'n' + time +'n'+ time2.toLocaleString());
    if (status.text().indexOf("available") == -1) {
      continue;
    }
    var links = status.find("a");
    for (var j = 0; j < links.length; ++j) {
      var link = $(links[j]);
      var url = link.attr("href");
      if (url.indexOf("http://t.co") == -1) {
        continue;
      }
      return url;
    }
    break;
  }
  return "";
}

//处理nike store 页面

function SubmitCart() {
  $(document).ready(function () {
    //$('*[value="3211862:4Y"]').trigger("click");
    //$('*[name="skuAndSize"]').attr("value","3211862:4Y");
    $('*[name="skuAndSize"]').val("3211862:4Y");
    $(".selectBox-label").text("(4Y)");

    $(".add-to-cart").trigger("click");

    alert("clicked!");
  });
  //alert("registed!");
}

//消息转发
function RequestHandle(request, sender, sendResponse) {
  console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.type == "checkAvalible") {
    sendResponse({ data: checkAvalible(request, sender, sendResponse) });
  } else if (request.type == "SubmitCart") {
    SubmitCart();
    sendResponse({ data: "ok" });
  } else if (request.type == "setRun") {
    isRun = true;
    sendResponse({ data: "ok" });
  } else if (request.type == "setStop") {
    isRun = false;
    sendResponse({ data: "ok" });
  } else sendResponse({ data: "error" });
}

function main() {
  console.log("started...");
  chrome.extension.onRequest.addListener(RequestHandle);
}

main();
```

上面的脚本就是 content script 了，宿在真实的页面中，但是与页面的 js 在不同的沙盒里面。可以用来操作 dom。
chrome.extension.onRequest.addListener 用来接受 background.js 发送来的消息。
sendResponse 用来进行回应。

完整代码在：[https://github.com/dingyaguang117/NikeStore](https://github.com/dingyaguang117/NikeStore)
