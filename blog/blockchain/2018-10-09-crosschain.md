---
layout: doc
title: "Cross-Chain Technology"
date: 2018-10-09 15:04:02 +0800
category: 区块链
---

**What is cross-chain technology?**

Cross-chain technology refers to the technology that can convert assets on a specific blockchain into assets on another blockchain, thus implement the value flow between chains. To put it simply, cross-chain technology is a chain conversion behavior of different asset holders, which does not change the total amount of assets on each chain. Similar to the coin-to-coin trading service provided by the exchange, but the exchange in the trading platform does not take place on the chain.

**Why does it matter now?**

FUSION, an infrastructure protocol designed to connect both traditional and cryptofinance systems that support digitized assets, has secured $12.3 bln in financial assets from three strategic partners, who will lock those assets on the startups’ public blockchain platform.

**Why we need an interoperability solution?**

Diverse networks competing for a share of the crypto market have unique advantages and disadvantages. As time goes on, it is becoming clearer that there is no perfect solution to all blockchain needs. There are trade-offs that have to be made in development to optimize a blockchain for specific purposes. There won't be just one chain in the future.
The difficulty of cooperating between different blockchain projects greatly limits the space for the use of blockchain projects. Therefore, how to implement cross-chain technology and multi-chain integration has become one of the hot spots in the current blockchain research.

**Basic principle**

All cross-chain techniques could be simplified to the the following progress:

1. User initiates a request to the cross-chain protocol for exchanging A blockchain coins for B blockchain coins
2. Cross-chain protocol lock user’s A blockchain coins
3. Cross-chain protocol lock corresponding amount of B blockchain coins
4. Send B blockchain coins to user’s B chain wallet address, and take away user’s A blockchain coins;

![](/blog/assets/img/2018-10-09-cross-chain-1.png)

**Technical Solutions**

Currently, There exist three cross-chain technologies:

- Notary schemes

  In Notary schemes, a group of credible nodes act as notaries to verify whether a specific event has happened on Blockchain A and prove it to the nodes of Blockchain B. Interledger proposed by Ripple Lab is a representative of Notary scheme.

- sidechain/relays

  If Blockchain B enables to verify the data coming from Blockchain A, Blockchain B is called a sidechain. Sidechains are usually based on coins anchored on a certain blockchain, while other Blockchains can exist independently. The famous bitcoin-sidechains include BTC Relay (proposed by ConsenSys), Rootstock and ElementChain (Proposed by BlockStream), and the other sidechains, not for Bitcoin, include Lisk and Asch.

  Relay chain technology temporarily locks a number of coins of an original Blockchain by transferring them to a multi-signature address of the original Blockchain, and these signers vote to determine whether the transactions happen on the relay chain are valid or not. Polkadot and COSMOS are representative relay chain technologies.

- hash-locking

  Hash-locking is a mechanism to carry out payment by locking some time to guess the plaintext of a hash value, which derives from Lightening Networks. However, hash-locking supports a limited number of functions. Although it supports cross-chain asset exchange and cross-chain asset encumbrance in most scenarios, it is not usable for cross-chain asset portability and cross-chain smart contract.

  Various crypto assets can be mapped to the wanchain/fushion public chain using distributed private key generation and control technology. These mapped crypto assets can interact freely on wanchain/fushion public chain. The lock-in/lock-out operations implement the control rights’ transferation and assets’ mapping.

**Application scenarios**

- cross chain settlement/mortgage

  This application can transfer the property mortgage in the real world to the blockchain world.

- decentralized exchange

  Decentralized exchanges differ from centralized exchanges in that assets are held in user wallets,and trades are on chain.

- cross chain wallet

  As the super-traffic entrance of blockchain and one of the most important infrastructures, wallet is an important place for users to store digital assets. By grafting cross-chain technology into the wallet ecosystem, cross-currency transactions can be provided to users. Some of the transactions were transferred to wallets.

- cross chain dApps
  The broken of Data islands will produce more valuable dApps.

**Summary**

We should keep watching the financial applications based on cross chain platforms. In the future, more and more assets in real world will be mapped to blockchain and become digital assets. Digital assets can be transferred, mortgaged and traded in different chains through cross chain technology, which greatly improves the security, traceability and convenience of asset transaction.
