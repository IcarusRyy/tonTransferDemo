import type { NextPage } from "next"
import { useEffect } from "react"
import TonWeb from "tonweb"
// import nacl from "tweetnacl"
const BN = require("bn.js")
const Home: NextPage = () => {
  const tonweb = new TonWeb(
    // new TonWeb.HttpProvider("https://testnet.toncenter.com/")
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", {
      apiKey: "",
    })

    // new TonWeb.HttpProvider("https://scalable-api.tonwhales.com/jsonRPC")
  )
  // const contract = new TestContract
  // nacl库用于创建密钥对
  const nacl = tonweb.utils.nacl
  // 创建新的密钥对
  const keyPair = nacl.sign.keyPair()
  // 为钱包智能合约创建接口
  // let wallet = tonweb.wallet.create({
  //   address: "kQBzGjj9GnmoWJI8TiYPVMs3NhQJZmrnPZ0bLxZ1sioynlaZ",
  // })
  // const simpleWallet = new tonweb.wallet.all.SimpleWalletContract({publicKey: keyPair.publicKey, wc: 0})
  // let wallet = tonweb.wallet.create({ publicKey: keyPair.publicKey, wc: 0 })
  const WalletClass = tonweb.wallet.all.v3R2
  // let wallet = new WalletClass(tonweb.provider, {
  //   publicKey: keyPair.publicKey,
  //   wc: 0,
  // })
  let wallet = new WalletClass(tonweb.provider, {
    // wallet contract address
    address: "kQBzGjj9GnmoWJI8TiYPVMs3NhQJZmrnPZ0bLxZ1sioynlaZ",
    wc: 0,
    walletId: 0,
    // EQBBCSxCCS9szvrRTxH_IKWnvqEmObubyLUIWtLufLYSrDhY
    // address: "EQBBCSxCCS9szvrRTxH_IKWnvqEmObubyLUIWtLufLYSrDhY",
  })
  const getSeqno = async () => {
    const res = await wallet.methods.seqno().call()
    console.log(res, "seqmp")
    console.log(Number(res), "getSeqno")
    return res
  }
  // 部署
  // 部署方法deploy
  const deploy = wallet.deploy(keyPair.secretKey)
  // 获取部署的估计费用
  const deployFee = async () => {
    const res = await deploy.estimateFee()
    console.log(res, "deployFee")
  }
  // 部署钱包智能合约到区块链上
  const deploySended = async () => {
    const res = await deploy.send()
    console.log(res, "deploySended")
  }
  // 获取部署查询单元
  const deployQuery = async () => {
    const res = await deploy.getQuery()
    console.log(res, "deployQuery")
  }
  const getWalletAddress = async () => {
    const res = await wallet.getAddress()
    console.log(res.toString(true, true, true), "钱包地址")
  }
  const onConnect = async () => {
    const provider = (window as any).ton
    console.log(provider, "provider")
    if (!provider) {
      console.log("provider is not exist")
    } else {
      // 获取当前用户钱包地址 get user wallet address
      const account = await provider.send("ton_requestAccounts")
      console.log(account, "account")
    }
  }

  const transfer = async () => {
    console.log(keyPair.secretKey, "keyPair.secretKey")
    const transfer = wallet.methods.transfer({
      secretKey: keyPair.secretKey,
      // my testnet wallet address
      toAddress: "EQBBCSxCCS9szvrRTxH_IKWnvqEmObubyLUIWtLufLYSrDhY",
      // toAddress: "EQBKqciVdby5paj95Egqr8RBUTro81Q4UceUxxq5_ayw8MqB",
      amount: tonweb.utils.toNano("0.5"),
      seqno: Number(getSeqno()),
      payload: "hellow",
      sendMode: 3,
    })
    await transfer.send()
  }
  const parseNumber = (
    num: any,
    units: number = 9,
    decimalPoints: number = 4
  ): number => {
    if (num.toString().length <= 9) {
      console.log(num, "num")
      return parseFloat(
        parseFloat(
          "0." + num.toString().padStart(units).replaceAll(" ", "0")
        ).toFixed(decimalPoints)
      )
    } else {
      return parseFloat(
        parseFloat(
          num.div(new BN(10 ** units)).toString() +
            "." +
            num.mod(new BN(10 ** units)).toString()
        ).toFixed(decimalPoints)
      )
    }
  }
  // 调用合约方法  call contract methods
  const callContractMethods = async () => {
    const res = await tonweb.call(
      "kQBzGjj9GnmoWJI8TiYPVMs3NhQJZmrnPZ0bLxZ1sioynlaZ",
      "hello_world"
    )
    console.log(res, "res")
    console.log(Number(res.stack[0][1]).toString(10), "res.stack")
    // console.log(parseNumber(new BN(eval(res.stack[0][1]))))
  }
  const getBalance = async () => {
    const address = "kQBzGjj9GnmoWJI8TiYPVMs3NhQJZmrnPZ0bLxZ1sioynlaZ"
    const balance = await tonweb.getBalance(address)
    console.log(balance, "balance")
    console.log(parseNumber(new BN(balance)), "bbalance")
    // return parseNumber(new BN(balance))
  }
  // const transfer = async () => {
  //   await tonweb.transfer()
  // }
  // 获取合约地址
  const getAddress = async () => {
    const addr = await tonweb.Address
    console.log(addr, "addr")
  }
  // 调用钱包
  const handleTransfer = async () => {
    await window.ton.send("ton_sendTransaction", [
      {
        to: "kQBzGjj9GnmoWJI8TiYPVMs3NhQJZmrnPZ0bLxZ1sioynlaZ",
        value: "200000000", // 10000 nanotons = 0.00001 TONs
        data: "dapp test",
        dataType: "text",
      },
    ])
  }
  useEffect(() => {
    onConnect()
  }, [])

  // 取钱 doWithDraw
  const doWithdraw = async (withDrwalRequest: any) => {
    console.log(withDrwalRequest, "withDrwalRequest")
    const seqno: number = (await wallet.methods.seqno().call()) || 0
    console.log(seqno, "seqno")
    if (seqno > withDrwalRequest.seqno) {
      // 此提款请求已经处理
      // 在您的数据库中标记它并转到下一个提款请求
      return true
    }
    const balance = new BN(
      await tonweb.provider.getBalance((await wallet.getAddress()).toString())
    )
    console.log(balance, "dowithdraw  balance")
    console.log(
      withDrwalRequest.amount.gte(balance),
      "withDrwalRequest.amount.get(balance)"
    )
    if (withDrwalRequest.amount.gte(balance)) {
      console.log("余额不足，无法取款")
      return false
    }
    // 如果收件人是尚未初始化的钱包
    // 那么需要发送非反弹转账
    // 作为一种选择，始终可以为提款进行非反弹转账
    let toAddress = withDrwalRequest.toAddress
    const info = await tonweb.provider.getAddressInfo(toAddress)
    console.log(info, "info")
    if (info.state !== "active") {
      // 转换为非反弹
      toAddress = new tonweb.utils.Address(toAddress).toString(
        true,
        true,
        false
      )
    }
    const isOfflineSign = false
    // 转账签名 离线操作
    const transfer = await wallet.methods.transfer({
      secretKey: keyPair.secretKey,
      toAddress: toAddress,
      amount: withDrwalRequest.amount,
      seqno: withDrwalRequest.seqno,
      payload: "123", // 如果需要，这里可以设置一个唯一的payload来区分操作
    })
    if (isOfflineSign) {
      // 转账查询
      const query = await transfer.getQuery()
      // 二进制BoC格式的序列化传输查询
      const boc = await query.toBoc(false)
      // base64格式
      const bocBase64 = tonweb.utils.bytesToBase64(boc)
      // 向网络发送传输请求
      await tonweb.provider.sendBoc(bocBase64)
    } else {
      // 向网络发送传输请求
      await transfer.send()
    }
  }
  // 注意
  // seqno 是钱包智能合约参数-对外转账请求的当前序列号。从0开始
  // 钱包智能合约只处理 当前智能合约的seqno === 请求消息的seqno
  // 如果他们相等。则钱包智能合约回处理转账并将seqno+1
  // 如果不相等。则丢弃该请求
  // 因此，seqno是防止双重推出的重要机制
  const init = async () => {
    // 从数据库中获取队列中的第一个提款请求
    const withDrwalRequest: any = {
      amount: TonWeb.utils.toNano("2"), // 2TON
      toAddress: "EQBBCSxCCS9szvrRTxH_IKWnvqEmObubyLUIWtLufLYSrDhY",
    }
    // 如果提现请求没有seqno，那么我们从网络中去除当前钱包的seqno
    if (!withDrwalRequest.seqno) {
      console.log(withDrwalRequest.seqno, "qqq")
      withDrwalRequest.seqno = await wallet.methods.seqno().call()
      // 设置seqno后，本次转账不再更改，防止重复提款
    }
    let isProcessing = false
    const tick = async () => {
      if (isProcessing) return
      isProcessing = true
      try {
        await doWithdraw(withDrwalRequest)
      } catch (e) {
        console.error(e, "eeeee")
      }
      isProcessing = false
    }
    setTimeout(tick, 1000) // 10 seconds
  }
  return (
    <>
      <div>helloworld</div>
      <button onClick={callContractMethods}>hello World</button>
      <button onClick={getBalance}>wallet contract ballance</button>
      <button onClick={getAddress}>wallet contract Address</button>
      <button onClick={handleTransfer}>handleTransfer</button>
      <button onClick={getWalletAddress}>wallet address</button>
      {/* <button onClick={transfer}>transfer</button> */}
      <button onClick={init}>init</button>
    </>
  )
}

export default Home
