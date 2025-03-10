import { ethers } from 'hardhat'
async function deployERC20() {
    const ERC20_CONTRACT_NAME = 'Conversion'
    const conversion = await ethers.deployContract(ERC20_CONTRACT_NAME, [
        [
            '0xAF93888cbD250300470A1618206e036E11470149',//coral
            '0xA0D0e6c4277a869cD3c8C3FEc7D00F0bd8E109e8',// trix
            '0x30BF3761147Ef0c86E2f84c3784FBD89E7954670',// diam
        ],
    ])
    await conversion.waitForDeployment()
    console.log('Deployed ERC20 contract address:', await conversion.getAddress())
}

async function main() {
    await deployERC20()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
