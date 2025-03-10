import { ethers } from 'hardhat'

const endpointAbi = [
    'function setSendLibrary(address oapp, uint32 eid, address sendLib) external',
    'function setReceiveLibrary(address oapp, uint32 eid, address receiveLib, uint256 gracePeriod) external',
]

const YOUR_OAPP_ADDRESS = '0x7cE7845bDE4277e8Aa132aC4c042605e7d42B71C'
const YOUR_SEND_LIB_ADDRESS = '0xC1868e054425D378095A003EcbA3823a5D0135C9'
const YOUR_RECEIVE_LIB_ADDRESS = '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d'
const YOUR_ENDPOINT_CONTRACT_ADDRESS = '0x6EDCE65403992e310A62460808c4b910D972f10f'

const remoteEid = 40245

async function main() {
    const sendingAccountPrivKey = process.env.DEPLOYER_ACCOUNT_PRIV_KEY
    if (!sendingAccountPrivKey) {
        throw new Error('Missing DEPLOYER_ACCOUNT_PRIV_KEY')
    }
    const sender = new ethers.Wallet(sendingAccountPrivKey, ethers.provider)

    const endpointContract = await ethers.getContractAt(endpointAbi, YOUR_ENDPOINT_CONTRACT_ADDRESS, sender)

    try {
        // Set the send library
        const sendTx = await endpointContract.setSendLibrary(YOUR_OAPP_ADDRESS, remoteEid, YOUR_SEND_LIB_ADDRESS)
        console.log('Send library transaction sent:', sendTx.hash)
        await sendTx.wait()
        console.log('Send library set successfully.')

        // Set the receive library
        const receiveTx = await endpointContract.setReceiveLibrary(
            YOUR_OAPP_ADDRESS,
            remoteEid,
            YOUR_RECEIVE_LIB_ADDRESS,
            0
        )
        console.log('Receive library transaction sent:', receiveTx.hash)
        await receiveTx.wait()
        console.log('Receive library set successfully.')
    } catch (error) {
        console.error('Transaction failed:', error)
    }
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
