import { Wallet, utils } from "ethers"
import env from '../env'
import { GWEI, PROVIDER } from './helpers'

async function main() {
    const testWallet = new Wallet(env.TEST_PRIVATE_KEY, PROVIDER)
    console.log("wallet", testWallet.address)
    const nonce = await testWallet.getTransactionCount()
    const txs = [0,1,2].map(i => ({
        chainId: env.CHAIN_ID,
        to: testWallet.address,
        from: testWallet.address,
        value: utils.parseEther("0.01"),
        nonce: nonce + i,
        gasLimit: 21000,
        gasPrice: GWEI.mul(15),
    }))
    const signedTxPromises = txs.map(tx => {
        return testWallet.signTransaction(tx)
    })
    const signedTxs = await Promise.all(signedTxPromises)
    console.log(signedTxs)
    // for (const tx of signedTxs) {
    //     console.log("SENDING", tx)
    //     const res = await PROVIDER.sendTransaction(tx)
    //     console.log(res)
    // }
}

main().then(() => {
    process.exit(0)
})