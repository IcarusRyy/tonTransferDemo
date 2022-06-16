import type { NextPage } from "next"
import { useEffect } from "react"
import TonWeb from "tonweb"

// import nacl from "tweetnacl"
const BN = require("bn.js")
const Home: NextPage = () => {
  const tonweb = new TonWeb(
    // new TonWeb.HttpProvider("https://testnet.toncenter.com/")
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", {
      apiKey:
        "bc49cc55b5041564a297b93691f7db607b4874ddca535bce003afc661e16d4fa",
    })

    // new TonWeb.HttpProvider("https://scalable-api.tonwhales.com/jsonRPC")
  )

  // const keyPair = TonWeb.utils.nacl.sign.keyPair();

  // console.log(TonWeb.utils.bytesToHex(keyPair.publicKey), 'publicKey');
  // console.log(TonWeb.utils.bytesToHex(keyPair.secretKey), 'secretKey')
  // 13e06eb8c27684a04b6f1c9979ae258e1dbb56882143f8f521a54eb02dd4565c  publicKey
  //  6161307029c80bcfe866b8d3222fe02a7ff0bbb1a83ed15d0e2dbf92848c26a313e06eb8c27684a04b6f1c9979ae258e1dbb56882143f8f521a54eb02dd4565c  secretKey

  // kQAPXqnvuwOjamm_4rsLGpgPY7R3kPYUXKwtskEV0c_zJi3v   wallet contract address

  const secretKey = TonWeb.utils.hexToBytes(
    "6161307029c80bcfe866b8d3222fe02a7ff0bbb1a83ed15d0e2dbf92848c26a3"
  )
  console.log(secretKey, "secreKey")
  const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(secretKey)

  const wallet = tonweb.wallet.create({
    address: "kQAPXqnvuwOjamm_4rsLGpgPY7R3kPYUXKwtskEV0c_zJi3v",
    wc: 0,
    walletId: 0,
    publicKey: keyPair.publicKey,
  })

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
  const walletBalance = async () => {
    const res = await tonweb.getBalance(
      "kQAPXqnvuwOjamm_4rsLGpgPY7R3kPYUXKwtskEV0c_zJi3v"
    )
    console.log(res, "钱包余额")
  }

  // 调用合约方法  call contract methods
  const callContractMethods = async () => {
    const res = await tonweb.call(
      "kQAPXqnvuwOjamm_4rsLGpgPY7R3kPYUXKwtskEV0c_zJi3v",
      "hello_world"
    )
    console.log(res, "res")
    console.log(Number(res.stack[0][1]).toString(10), "res.stack")
    // console.log(parseNumber(new BN(eval(res.stack[0][1]))))
  }
  const getPublicKey = async () => {
    const res = await tonweb.call(
      "kQAPXqnvuwOjamm_4rsLGpgPY7R3kPYUXKwtskEV0c_zJi3v",
      "get_public_key"
    )
    console.log(res, "public Key")
    console.log(Number(res.stack[0][1]).toString(10), "public Key")
  }
  // 部署钱包智能合约到区块链上
  const deploySended = async () => {
    const deploy = wallet.deploy(keyPair.secretKey)

    const res = await deploy.send()
    console.log(res, "deploySended")
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
    const a = withDrwalRequest.amount.gte(balance)
    console.log(a, "withDrwalRequest.amount.get(balance)")
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
      toAddress = new TonWeb.utils.Address(toAddress).toString(
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
      const bocBase64 = TonWeb.utils.bytesToBase64(boc)
      // 向网络发送传输请求
      await tonweb.provider.sendBoc(bocBase64)
    } else {
      // 向网络发送传输请求
      console.log("send")
      const res = await transfer.send()
      console.log(res, "ressss")
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
      amount: TonWeb.utils.toNano("1"), // 2TON
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
      <button onClick={getPublicKey}>get contract public key</button>
      <button onClick={init}>init</button>
      <button onClick={deploySended}>deploy wallet</button>
      <button onClick={walletBalance}>wallet Balance</button>
    </>
  )
}

export default Home
