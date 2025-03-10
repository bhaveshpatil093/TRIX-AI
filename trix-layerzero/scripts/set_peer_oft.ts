import { zeroPad } from '@ethersproject/bytes'
import { ethers } from 'hardhat'
import { deploymentConfig } from '../deployment_config'

async function setPeerMyOFT() {
    const OFT_CONTRACT_NAME = 'CustomToken_OFT'
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()
    const lzEndpointIdOnSrcChain = deploymentConfig[5003].lzEndpointId
    const oftContractAddress = deploymentConfig[chainId].oft_address
    const oftAdapterContractAddress = deploymentConfig[5003].adapterAddress
    console.log(
        `setPeerMyOFT - oftContractAddress:${oftContractAddress}, lzEndpointIdOnSrcChain:${lzEndpointIdOnSrcChain}, oftAdapterContractAddress:${oftAdapterContractAddress}`
    )
    const myOFTContract = await ethers.getContractAt(OFT_CONTRACT_NAME, oftContractAddress)

    // https://docs.layerzero.network/v2/developers/evm/oft/quickstart#setting-trusted-peers
    const tx = await myOFTContract.setPeer(lzEndpointIdOnSrcChain, zeroPad(oftAdapterContractAddress, 32))
    const txReceipt = await tx.wait()

    console.log('MyOFT - setPeer tx:', txReceipt?.hash)
}

async function main() {
    await setPeerMyOFT()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
