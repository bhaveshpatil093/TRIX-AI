import { zeroPad } from '@ethersproject/bytes'
import { ethers } from 'hardhat'
import { deploymentConfig } from '../deployment_config'

async function getPeer() {
    const OFTAdapter_CONTRACT_NAME = 'LZ_Adapter'
    const OFT_CONTRACT_NAME = 'CustomToken_OFT'
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()
    const oftAdapterContractAddress = deploymentConfig[chainId].adapterAddress
    const lzEndpointIdOnDestChain = deploymentConfig[57054].lzEndpointId
    const oftContractAddress = deploymentConfig[57054].oft_address
    console.log(
        `getPeer - oftAdapterContractAddress:${oftAdapterContractAddress}, lzEndpointIdOnDestChain:${lzEndpointIdOnDestChain}, oftContractAddress:${oftContractAddress}`
    )

    const myOFTAdapterContract = await ethers.getContractAt(OFTAdapter_CONTRACT_NAME, oftAdapterContractAddress)

    //   console.log("myOFTAdapterContract:", myOFTAdapterContract.interface.fragments);
    // https://docs.layerzero.network/v2/developers/evm/oft/quickstart#setting-trusted-peers
    const tx = await myOFTAdapterContract.isPeer(lzEndpointIdOnDestChain, zeroPad(oftContractAddress, 32))

    console.log('MyOFTAdapter - getPeer tx:', tx)
}

async function main() {
    await getPeer()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
