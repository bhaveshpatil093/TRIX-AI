import { zeroPad } from '@ethersproject/bytes'
import { ethers } from 'hardhat'
import { deploymentConfig } from '../deployment_config'

async function setPeerMyOFTAdapter() {
    const OFTAdapter_CONTRACT_NAME = 'LZ_Adapter'
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()
    const oftAdapterContractAddress = deploymentConfig[chainId].adapterAddress
    const lzEndpointIdOnDestChain = deploymentConfig[84532].lzEndpointId
    const oftContractAddress = deploymentConfig[84532].oft_address
    console.log(
        `setPeerMyOFTAdapter - oftAdapterContractAddress:${oftAdapterContractAddress}, lzEndpointIdOnDestChain:${lzEndpointIdOnDestChain}, oftContractAddress:${oftContractAddress}`
    )

    const myOFTAdapterContract = await ethers.getContractAt(OFTAdapter_CONTRACT_NAME, oftAdapterContractAddress)

    // https://docs.layerzero.network/v2/developers/evm/oft/quickstart#setting-trusted-peers
    const tx = await myOFTAdapterContract.setPeer(lzEndpointIdOnDestChain, zeroPad(oftContractAddress, 32))
    const txReceipt = await tx.wait()

    console.log('MyOFTAdapter - setPeer tx:', txReceipt?.hash)
}

async function main() {
    await setPeerMyOFTAdapter()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
