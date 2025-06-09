---
layout: doc
title: "NodePort 服务下的流量摘除：kube-proxy 的工作机制"
date: 2025-04-05 16:14:02 +0800
category: 后端
hidden: true
---

在 Kubernetes 集群中，当我们谈论优雅停止的过程时，服务流量的摘除是关键环节。特别是对于使用 NodePort 类型的服务，理解 kube-proxy 如何处理流量摘除对于排查问题和优化配置至关重要。本文将深入探讨在 NodePort 服务模式下，kube-proxy 是如何实现对终止中 Pod 的流量摘除的。

## kube-proxy 的角色与职责

kube-proxy 是 Kubernetes 集群中运行在每个节点上的网络代理组件，负责实现 Kubernetes Service 的核心网络功能。它监听 API Server 中服务和端点的变化，并维护节点上的网络规则，确保到达服务的流量能正确分发到后端 Pod。

在 NodePort 类型的服务中，kube-proxy 的职责尤为重要—它负责在集群的每个节点上开放指定的端口，并将到达该端口的流量转发至相应的后端 Pod。

## NodePort 服务的流量路径

当用户创建一个 NodePort 类型的服务时，系统会执行以下操作：

1. Kubernetes 控制平面会为该服务分配一个集群内部 IP（ClusterIP）
2. 同时在 30000-32767 范围内分配一个端口（NodePort）
3. kube-proxy 确保来自任何集群节点该端口的请求被转发到服务的后端 Pod

这种设计使得外部流量可以通过 `<节点IP>:<NodePort>` 访问服务，无论该服务的 Pod 实际运行在哪个节点上。

## kube-proxy 的工作模式

理解 kube-proxy 的流量摘除机制，首先需要了解它的不同工作模式：

1. **userspace 模式**（较早期的实现，现已很少使用）
2. **iptables 模式**（目前的默认模式）
3. **IPVS 模式**（高性能模式，适用于大型集群）

不同模式下，kube-proxy 摘流的具体实现细节有所差异。

### iptables 模式下的流量摘除

在最常见的 iptables 模式下，kube-proxy 通过操作 Linux iptables 规则实现流量转发和负载均衡。当 Pod 进入终止状态时，流量摘除过程如下：

1. **端点变更检测**：kube-proxy 通过 watch 机制监听 API Server 中的 Endpoints 对象变化。当 Pod 被标记为 Terminating 状态时，控制平面会更新相应 Service 的 Endpoints 列表，移除该 Pod。

2. **规则更新**：kube-proxy 检测到 Endpoints 变更后，立即更新节点上的 iptables 规则，移除指向该终止 Pod 的转发规则。

3. **规则应用**：修改后的 iptables 规则会立即生效，新的连接请求不再转发到终止中的 Pod。但需要注意，已经建立的连接会继续维持，直到连接关闭或超时。

这个过程通常需要几秒钟才能在整个集群中完成传播。在大型集群中，这种延迟可能更为明显，这也是为什么在优雅停止设计中常常需要添加额外的缓冲时间。

### IPVS 模式下的流量摘除

IPVS（IP Virtual Server）模式是为大型集群优化的高性能模式。在此模式下，kube-proxy 利用 Linux 内核的 IPVS 模块实现负载均衡，具有更高效的数据结构和更低的规则同步延迟：

1. **端点监听**：与 iptables 模式类似，kube-proxy 监听 Endpoints 的变化。

2. **IPVS 规则更新**：当检测到 Pod 进入终止状态时，kube-proxy 更新 IPVS 虚拟服务器规则，从负载均衡池中移除该 Pod 的 IP 地址。

3. **连接追踪**：IPVS 提供了更精细的连接追踪机制，可以更有效地处理现有连接。

IPVS 模式的一个显著优势是其规则更新效率更高，尤其是在服务数量庞大的集群中，能够更快地完成流量摘除，减少优雅停止过程中的"流量尾巴"问题。

## 实际的流量摘除时序

在实际操作中，NodePort 服务的流量摘除涉及以下时序事件：

1. **Pod 标记为终止**：当执行 `kubectl delete pod` 或因滚动更新等原因触发 Pod 删除时，API Server 将 Pod 状态更新为 "Terminating"。

2. **EndpointSlice 控制器响应**：Kubernetes 1.19 之后，EndpointSlice 控制器（替代较早的 Endpoints 控制器）检测到 Pod 状态变化，将该 Pod 从相关服务的活跃端点列表中移除。

3. **kube-proxy 获取更新**：各节点上的 kube-proxy 通过 watch API 获取 EndpointSlice 的变更。

4. **网络规则更新**：kube-proxy 更新本地网络规则（iptables/IPVS），不再将新请求路由到终止中的 Pod。

5. **Pod 接收 SIGTERM**：同时，kubelet 向 Pod 容器发送 SIGTERM 信号，启动应用层面的优雅停止。

这个过程中存在几个关键延迟点：

- API Server 到 EndpointSlice 控制器的事件传播延迟
- EndpointSlice 更新到 kube-proxy 的通知延迟
- kube-proxy 处理并应用网络规则的时间
- 网络规则在内核中生效的时间

在大型集群或高负载条件下，这些延迟累加起来可能导致 Pod 在开始终止过程后仍然接收到几秒甚至更长时间的请求。

## 解决 NodePort 摘流延迟问题

针对 NodePort 服务中的流量摘除延迟，以下策略可以帮助优化：

1. **优化 PreStop 钩子**：在 Pod 规范中添加 PreStop 钩子，包含一个短暂的睡眠期（通常 5-10 秒），给予 kube-proxy 足够时间更新网络规则：

```yaml
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 10 && echo 'PreStop hook executed'"]
```

2. **考虑 IPVS 模式**：在大型集群中，将 kube-proxy 配置为 IPVS 模式可以提高规则更新效率：

```yaml
# kube-proxy ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-proxy
  namespace: kube-system
data:
  config.conf: |-
    mode: "ipvs"
```

3. **实现应用级摘流**：在应用层实现准备关闭的状态检查，在收到 SIGTERM 后立即停止接受新请求，同时处理完当前请求：

```go
// 示例代码（Go）
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGTERM)

go func() {
    <-sigChan
    log.Println("SIGTERM received, starting graceful shutdown")

    // 停止接受新请求
    server.SetKeepAlivesEnabled(false)

    // 等待当前请求完成
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited gracefully")
}()
```

4. **调整 kube-proxy 同步间隔**：在某些情况下，可以优化 kube-proxy 的配置参数，减少同步延迟：

```yaml
# kube-proxy 配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: kube-proxy
  namespace: kube-system
data:
  config.conf: |-
    iptables:
      syncPeriod: "10s"  # 默认为30s，可适当减少
```

## 跨节点流量的特殊考虑

在 NodePort 服务中，一个特别需要考虑的场景是跨节点流量转发。当请求到达某个节点的 NodePort，但目标 Pod 实际运行在另一个节点上时，kube-proxy 需要进行额外的跨节点路由。这种情况下，流量摘除涉及多个节点上的 kube-proxy 实例，可能导致更长的规则传播延迟。

为了优化这种情况，可以考虑：

1. **使用外部负载均衡器**（如果可能）：它们通常具有更高效的健康检查机制
2. **配置节点亲和性**：尽可能让相关 Pod 和服务部署在同一节点，减少跨节点流量

## 实时监控流量摘除过程

要验证和排查流量摘除问题，以下工具和方法非常有用：

1. **观察 iptables 规则变化**：

   ```bash
   watch -n 1 "iptables-save | grep <service-name>"
   ```

2. **监控 kube-proxy 日志**：

   ```bash
   kubectl logs -n kube-system -l k8s-app=kube-proxy --tail=100 -f
   ```

3. **使用 conntrack 工具查看连接状态**：

   ```bash
   conntrack -L | grep <pod-ip>
   ```
