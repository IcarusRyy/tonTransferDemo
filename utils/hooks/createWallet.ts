import TonWeb from "tonweb"

const createWallet = async (keyPair: any) => {
  const tonweb = new TonWeb()
  const WalletClass = tonweb.wallet.all.v3R2
  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.public,
  })
}
export default createWallet
