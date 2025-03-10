import { ethers } from 'hardhat'
async function deployERC20() {
    const ERC20_CONTRACT_NAME = 'CustomToken'
    const tokenSymbol = 'TRIX'
    const tokenName = 'TRIX'
    const myERC20Contract = await ethers.deployContract(ERC20_CONTRACT_NAME, [tokenName, tokenSymbol])
    await myERC20Contract.waitForDeployment()
    console.log('Deployed ERC20 contract address:', await myERC20Contract.getAddress())
}

async function main() {
    await deployERC20()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
