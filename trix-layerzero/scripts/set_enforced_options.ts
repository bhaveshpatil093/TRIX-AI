import { ethers } from 'hardhat'

// https://docs.layerzero.network/v2/developers/evm/gas-settings/options#options-sdk
import { Options } from '@layerzerolabs/lz-v2-utilities'
import { deploymentConfig } from '../deployment_config'
const OFTAdapter_CONTRACT_NAME = 'LZ_Adapter'
const OFT_CONTRACT_NAME = 'CustomToken_OFT'

async function setEnforcedOptions() {
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()
    const isForOFTAdapter = false
    const executorLzReceiveOptionMaxGas = Number(200000)
    const lzEndpointIdOnRemoteChain = deploymentConfig[84532].lzEndpointId
    const oftAdapterContractAddress = deploymentConfig[84532].adapterAddress
    const oftContractAddress = deploymentConfig[chainId].oft_address

    console.log(
        `setEnforcedOptions - isForOFTAdapter:${isForOFTAdapter}, oftAdapterContractAddress:${oftAdapterContractAddress}, oftContractAddress:${oftContractAddress}, executorLzReceiveOptionMaxGas:${executorLzReceiveOptionMaxGas}, lzEndpointIdOnRemoteChain:${lzEndpointIdOnRemoteChain}`
    )

    const myOFTAdapterContract = await ethers.getContractAt(OFTAdapter_CONTRACT_NAME, oftAdapterContractAddress)

    const myOFTContract = await ethers.getContractAt(OFT_CONTRACT_NAME, oftContractAddress)

    const myContract = isForOFTAdapter ? myOFTAdapterContract : myOFTContract

    // https://docs.layerzero.network/v2/developers/evm/gas-settings/options#lzreceive-option
    const options = Options.newOptions().addExecutorLzReceiveOption(executorLzReceiveOptionMaxGas, 0)

    // https://docs.layerzero.network/v2/developers/evm/oft/quickstart#setting-enforced-options
    let enforcedOptions = [
        {
            eid: lzEndpointIdOnRemoteChain, // destination Endpoint ID
            msgType: 1,
            options: options.toBytes(),
        },
    ]

    const tx = await myContract.setEnforcedOptions(enforcedOptions)
    const txReceipt = await tx.wait()
    console.log('setEnforcedOptions tx:', txReceipt?.hash)
}

async function main() {
    await setEnforcedOptions()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
