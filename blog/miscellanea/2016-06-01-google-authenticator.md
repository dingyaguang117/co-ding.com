---
layout: doc
title: "程序员的安全意识"
date: 2016-06-01 00:00:00 +0800
category: "杂项"
---

近期发生了好多安全事件，大前天我的 Blog 被黑了，还发了几条网赚文章。前天有人绕过验证通过 VPN 进入公司内网并进行了密码破解尝试，而且尝试的用户名还是公司的英文名和某个产品名字，对我们的信息非常了解。  
在出了一裤衩汗之后，决定再整理一下安全事项。

1. 注册网站使用随机密码  
    其实在上个月我已经把密码管理全部托管到 1password 了，不过由于注册的网站实在太多，所以并没有逐一修改密码，只是在新注册的账号全部使用随机生成密码。  
   另外重要账户全部开启了二步验证，国内厂商喜欢用短信，国外厂商喜欢用 Google Authenticator.

2. 服务器登录使用二步验证

在项目开发中，也可以多多使用 Google Authenticator 来做二步验证，很方便却大大提高了安全性。
另外附一下 ubuntu 开启 google 二步验证的方法：

    ```
    一、安装
    sudo apt-get install libpam-google-authenticator

    二、 配置
    vim /etc/pam.d/sshd
      +  auth required pam_google_authenticator.so

    vim /etc/ssh/sshd_config
      -  ChallengeResponseAuthentication no
      +  ChallengeResponseAuthentication yes

    三、 生成秘钥
    google-authenticator

    四、 重启
    sudo service ssh restart

    五、下载 Google Authenticator APP
    添加基于时间线的密钥
    ```

3. 登录内网服务器使用跳板机  
   使用跳板机有利于运维监控管理所有的 session、减少入侵点，降低痕迹分析难度。
