const TonWeb = require("tonweb");
const tonMnemonic = require("tonweb-mnemonic");

const tonweb = new TonWeb(
    new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", {
        apiKey: "c36955338f70b29cef2d57401e8b11a94e2dffee6bd272015de2fd50c7dddacb",
    })
)

const createWallet = async (publicKey) => {
    const WalletClass = tonweb.wallet.all.v3R2;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: publicKey
    });
    const address = await wallet.getAddress();
    return wallet;
}

const getBalance = async (src) => {
    return await tonweb.provider.getBalance(src.address.toString());
}

const getSeqno = async (src) => {
    const info = await tonweb.provider.getAddressInfo(src.address.toString());
    let seqno = 0;
    if (info && info.state === 'active') {
        seqno = await src.methods.seqno().call();
    }
    return seqno;
}

const transfer = async (src, secretKey, dst, amount, payload) => {
    const balance = await getBalance(src);
    const seqno = await getSeqno(src);
    console.log("balance:", balance, "seqno:", seqno);
    const transfer = src.methods.transfer({
        secretKey: secretKey,
        toAddress: dst,
        amount: tonweb.utils.toNano(amount),
        seqno: Number(seqno),
        payload: payload,
        sendMode: 3, // sender pay fees, ignore errors

    })
    return await transfer.send();
}

(async () => {
    //const words = await tonMnemonic.generateMnemonic(); // random words
    const words = ["nerve", "explain", "pet", "dash", "voyage", "key", "abstract", "company", "ask", "phone", "tool", "perfect", "method", "chunk", "dose", "pizza", "grocery", "stamp", "imitate", "bullet", "couple", "addict", "stone", "pretty"];
    const seed = await tonMnemonic.mnemonicToSeed(words);
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const wallet = await createWallet(keyPair.publicKey);
    console.log("words:", words.join(' '));
    console.log("secretKey:", TonWeb.utils.bytesToHex(keyPair.secretKey));
    console.log("address:", wallet.address.toString(true, true, true));
    const res = await transfer(wallet, keyPair.secretKey, "EQBBCSxCCS9szvrRTxH_IKWnvqEmObubyLUIWtLufLYSrDhY", "0.001", "test");
    console.log("res:", res);
})();
