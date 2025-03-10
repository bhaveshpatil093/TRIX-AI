import { ethers } from 'hardhat'
const { deploymentConfig } = require('../deployment_config')
async function deployOFT() {
    const OFT_CONTRACT_NAME = 'CustomToken_OFT'
    const mintedTokenName = 'TRIX'
    const mintedTokenSymbol = 'TRIX'
    const contractOwner: string = await ethers.getSigners().then((res) => res[0].address)
    const chainId = +(await ethers.provider.getNetwork().then((res) => res.chainId)).toString()
    console.log(
        'Deploying OFT contract on chainId:',
        chainId,
        contractOwner,
        deploymentConfig[chainId].lzEndpointOnSrcChain
    )

    const myOFTContract = await ethers.deployContract(OFT_CONTRACT_NAME, [
        mintedTokenName,
        mintedTokenSymbol,
        deploymentConfig[chainId].lzEndpointOnSrcChain,
        contractOwner,
    ])

    await myOFTContract.waitForDeployment()

    console.log('Deployed OFT contract address:', await myOFTContract.getAddress())
}

async function main() {
    await deployOFT()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
