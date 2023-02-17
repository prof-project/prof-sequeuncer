import { BigNumber, Contract, utils } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { getSwapdArgs } from './lib/cliArgs'
import contracts from './lib/contracts'
import env from './lib/env'
import { ETH, MAX_U256, populateTxFully, coinToss, randInRange } from './lib/helpers'
import { PROVIDER } from './lib/providers'

import { loadDeployment, getExistingDeploymentFilename } from "./lib/liquid"
import { getAdminWallet, getWalletSet } from './lib/wallets'
import { approveIfNeeded, createRandomSwap, mintIfNeeded, signSwap } from './lib/swap'
import { sendSwaps } from './lib/scripts/swap'

async function main() {
    // get cli args
    const {startIdx, endIdx, numSwaps, numPairs} = getSwapdArgs()
    // TODO: impl numPairs!
    // TODO: impl numSwaps!

    const walletSet = getWalletSet(startIdx, endIdx)

    // get deployment params (// TODO: specify deployment via cli params)
    const deployment = await loadDeployment({})

    const {
        atomicSwap,
        uniV2FactoryA,
        uniV2FactoryB,
        weth,
        dai,
    } = deployment.getDeployedContracts(PROVIDER)

    // check token balances for each wallet, mint more if needed
    const adminWallet = getAdminWallet().connect(PROVIDER)
    let adminNonce = await adminWallet.getTransactionCount()

    console.log("using wallets", walletSet.map(w => w.address))

    // check wallet balance for each token, mint if needed
    await mintIfNeeded(PROVIDER, adminWallet, adminNonce, walletSet, weth, dai)

    // check atomicSwap allowance for each wallet, approve max_uint if needed
    await approveIfNeeded(PROVIDER, walletSet, {
        atomicSwapContract: atomicSwap,
        wethContract: weth,
        daiContracts: dai,
    })

    PROVIDER.on('block', async blockNum => {
        console.log(`[BLOCK ${blockNum}]`)
        // send random swaps
        sendSwaps({}, PROVIDER, walletSet, deployment)
    })
}

main()
