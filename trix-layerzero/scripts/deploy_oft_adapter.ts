import { ethers } from 'hardhat'
import { deploymentConfig } from '../deployment_config'
async function deployOFTAdapter() {
    const OFTAdapter_CONTRACT_NAME = 'LZ_Adapter'
    const contractOwner: string = await ethers.getSigners().then((res) => res[0].address)
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()

    console.log(
        'Deploying OFTAdapter contract on chainId:',
        chainId,
        contractOwner,
        deploymentConfig[chainId].zeUSDAddress,
        deploymentConfig[chainId].lzEndpointOnSrcChain
    )
    console.log('Deploying Adapter Contract ...')
    const myOFTAdapterContract = await ethers.deployContract(OFTAdapter_CONTRACT_NAME, [
        deploymentConfig[chainId].zeUSDAddress,
        deploymentConfig[chainId].lzEndpointOnSrcChain,
        contractOwner,
    ])
    await myOFTAdapterContract.waitForDeployment()

    console.log('Deployed OFTAdapter contract address:', await myOFTAdapterContract.getAddress())
}

async function main() {
    await deployOFTAdapter()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
