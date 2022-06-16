import TonWeb from "tonweb"
import tonMnemonic from "tonweb-mnemonic"
const createKeypair = async () => {
  const words = await tonMnemonic.generateMnemonic()
  console.log(words, "words")
  const seed = await tonMnemonic.mnemonicToSeed(words)
  const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed)
  return keyPair
}
export default createKeypair
