import { Request, Response, Router } from 'express'
import { Options } from '@layerzerolabs/lz-v2-utilities'
import { waitForMessageReceived } from '@layerzerolabs/scan-client'
import { zeroPad } from '@ethersproject/bytes'
import { ethers } from 'ethers'
import { deploymentConfig } from '../deployment_config'

import dotenv from 'dotenv'
dotenv.config()
import { AdapterABI, CustomTokenABI, OftABI, ConversionAbi, ConversionAddress } from '../constant'
const router = Router()

if (!process.env.RPC_URL) {
    console.error('❌ Missing RPC_URL in environment variables.')
    process.exit(1)
}

if (!process.env.DEPLOYER_ACCOUNT_PRIV_KEY) {
    console.error('❌ Missing DEPLOYER_ACCOUNT_PRIV_KEY in environment variables.')
    process.exit(1)
}
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const signer = new ethers.Wallet(process.env.DEPLOYER_ACCOUNT_PRIV_KEY, provider)

const getContractInstance = (contractAddress: any, contractABI: any) => {
    console.log('✅ Contract Address:', contractAddress)
    return new ethers.Contract(contractAddress, contractABI, signer)
}

router.get('/', (req: Request, res: Response): void => {
    res.status(200).json({
        message: 'Hey welcome to layer zero apis',
    })
})

router.post('/convertSToDesiredToken', async (req: Request, res: Response): Promise<void> => {
    const { tokenId, amount } = req.body
    console.log('convert - req.body:', tokenId)
    if (!amount) {
        res.status(400).json({
            message: 'Bad Request',
            data: 'tokenId, amount are required',
        })
        return
    }
    const conversionContractInstance = getContractInstance(ConversionAddress, ConversionAbi as any)
    console.log('✅ Contracts Initialized!', conversionContractInstance)
    const amountInWei = ethers.parseEther(amount.toString())
    console.log('convert - amountInWei:', amountInWei)
    console.log('convert - tokenId:', tokenId)
    try {
        const tx = await conversionContractInstance.convertSToDesiredToken(tokenId, {
            value: amountInWei,
        })
        const txReceipt = await tx.wait()
        console.log('convert - tx:', txReceipt?.hash)
        res.status(200).json({
            message: 'Success',
            data: {
                receipt: txReceipt,
                message: 'convert - tx',
                url: `https://testnet.sonicscan.org/tx/${txReceipt?.hash}`,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            data: error,
        })
    }
})

router.post('/convertDesiredTokenToS', async (req: Request, res: Response): Promise<void> => {
    const { tokenId, amount } = req.body
    console.log('convert - req.body:', req.body)
    if (!amount) {
        res.status(400).json({
            message: 'Bad Request',
            data: 'tokenId, amount are required',
        })
        return
    }
    const conversionContractInstance = getContractInstance(ConversionAddress, ConversionAbi as any)
    console.log('✅ Contracts Initialized!', conversionContractInstance)
    const amountInWei = ethers.parseEther(amount.toString())
    console.log('convert - amountInWei:', amountInWei)
    console.log('convert - tokenId:', tokenId)
    try {
        const tx = await conversionContractInstance.convertDesiredTokenToS(tokenId,amountInWei)
        const txReceipt = await tx.wait()
        console.log('convert - tx:', txReceipt?.hash)
        res.status(200).json({
            message: 'Success',
            data: {
                receipt: txReceipt,
                message: 'convert - tx',
                url: `https://testnet.sonicscan.org/tx/${txReceipt?.hash}`,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            data: error,
        })
    }
})

router.post('/sendOFT', async (req: Request, res: Response): Promise<void> => {
    const { srcChainId, destChainId, amount, receivingAccountAddress } = req.body
    console.log('sendOFT - req.body:', req.body)
    if (!srcChainId || !destChainId || !amount || !receivingAccountAddress) {
        res.status(400).json({
            message: 'Bad Request',
            data: 'srcChainId, destChainId, amount, receivingAccountAddress are required',
        })
        return
    }
    if (!(srcChainId in deploymentConfig) || !(destChainId in deploymentConfig)) {
        res.status(400).json({
            message: 'Invalid srcChainId or destChainId',
            data: 'Ensure both chain IDs are valid keys in deploymentConfig',
        })
        return
    }

    const network = await provider.getNetwork()
    console.log('✅ Network:', network)
    const blockNumber = await provider.getBlockNumber()
    console.log('✅ Connected! Latest Block:', blockNumber)

    const oftAdapterContractAddress = deploymentConfig[srcChainId as keyof typeof deploymentConfig].adapterAddress
    const lzEndpointIdOnSrcChain = deploymentConfig[srcChainId as keyof typeof deploymentConfig].lzEndpointId
    const lzEndpointIdOnDestChain = deploymentConfig[destChainId as keyof typeof deploymentConfig].lzEndpointId
    const erc20TokenAddress = deploymentConfig[srcChainId as keyof typeof deploymentConfig].zeUSDAddress

    const gasDropInWeiOnDestChain = process.env.gasDropInWeiOnDestChain
    const executorLzReceiveOptionMaxGas = process.env.executorLzReceiveOptionMaxGas
    const receiverAddressInBytes32 = zeroPad(receivingAccountAddress, 32)
    const adapterContractInstance = getContractInstance(oftAdapterContractAddress, AdapterABI as any)
    const customTokenContractInstance = getContractInstance(erc20TokenAddress, CustomTokenABI as any)

    const amountInWei = ethers.parseEther(amount.toString())

    console.log(
        `sendOFT - oftAdapterContractAddress:${oftAdapterContractAddress}, lzEndpointIdOnSrcChain:${lzEndpointIdOnSrcChain}, lzEndpointIdOnDestChain:${lzEndpointIdOnDestChain}, gasDropInWeiOnDestChain:${gasDropInWeiOnDestChain}, executorLzReceiveOptionMaxGas:${executorLzReceiveOptionMaxGas}, receivingAccountAddress:${receivingAccountAddress}, amount:${amount}, erc20TokenAddress:${erc20TokenAddress}`
    )

    const approveTx = await customTokenContractInstance.approve(oftAdapterContractAddress, amountInWei)
    const approveTxReceipt = await approveTx.wait()
    console.log('sendOFT - approve tx:', approveTxReceipt?.hash)
    console.log('✅ Approved!')

    const options = Options.newOptions()
        .addExecutorNativeDropOption(BigInt(gasDropInWeiOnDestChain as any), receivingAccountAddress)
        .addExecutorLzReceiveOption(BigInt(executorLzReceiveOptionMaxGas as any), 0)
        .toHex()
        .toString()

    const sendParam = [
        lzEndpointIdOnDestChain,
        receiverAddressInBytes32,
        amountInWei,
        amountInWei,
        options, // additional options
        '0x', // composed message for the send() operation
        '0x', // OFT command to be executed, unused in default OFT implementations
    ]

    try {
        const [nativeFee] = await adapterContractInstance.quoteSend(sendParam, false)
        console.log('sendOFT - estimated nativeFee:', ethers.formatEther(nativeFee))

        const sendTx = await adapterContractInstance.send(
            sendParam as any,
            [nativeFee, 0] as any, // set 0 for lzTokenFee
            receivingAccountAddress, // refund address
            {
                value: nativeFee,
            }
        )
        const sendTxReceipt = await sendTx.wait()
        console.log('sendOFT - send tx on source chain:', sendTxReceipt?.hash)

        // // Wait for cross-chain tx finalization by LayerZero
        console.log('Wait for cross-chain tx finalization by LayerZero ...')
        const deliveredMsg = await waitForMessageReceived(
            Number(lzEndpointIdOnDestChain),
            sendTxReceipt?.hash as string
        )
        console.log('sendOFT - received tx on destination chain:', deliveredMsg?.dstTxHash)
        res.status(200).json({
            message: 'Success',
            data: {
                receipt: sendTxReceipt,
                message: 'sendOFT - received tx on destination chain',
                url: `https://testnet.layerzeroscan.com/tx/${sendTxReceipt?.hash}`,
            },
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            data: error,
        })
    }
})

router.post('/set-peer', async (req: Request, res: Response): Promise<void> => {
    const { srcChainId, destChainId } = req.body
    try {
        if (!srcChainId || !destChainId) {
            res.status(400).json({
                message: 'Bad Request',
                data: 'srcChainId, destChainId are required',
            })
            return
        }
        if (!(srcChainId in deploymentConfig) || !(destChainId in deploymentConfig)) {
            res.status(400).json({
                message: 'Invalid srcChainId or destChainId',
                data: 'Ensure both chain IDs are valid keys in deploymentConfig',
            })
            return
        }
        if (
            !deploymentConfig[srcChainId as keyof typeof deploymentConfig].adapterAddress ||
            !deploymentConfig[destChainId as keyof typeof deploymentConfig].lzEndpointId ||
            !deploymentConfig[destChainId as keyof typeof deploymentConfig].oft_address
        ) {
            res.status(400).json({
                message: 'Bad Request',
                data: 'Source Chain Required Data is Not Avaialble in config file ',
            })
            return
        }
        const oftAdapterContractAddress = deploymentConfig[srcChainId as keyof typeof deploymentConfig].adapterAddress
        const adapterContractInstance = getContractInstance(oftAdapterContractAddress, AdapterABI as any)

        const isSourcPeerAlready = await adapterContractInstance.isPeer(
            deploymentConfig[destChainId as keyof typeof deploymentConfig].lzEndpointId,
            zeroPad(deploymentConfig[destChainId as keyof typeof deploymentConfig].oft_address, 32)
        )
        if (isSourcPeerAlready) {
            console.log('Peer Already Set in Source Chain')
        } else {
            const tx = await adapterContractInstance.setPeer(
                deploymentConfig[destChainId as keyof typeof deploymentConfig].lzEndpointId,
                zeroPad(deploymentConfig[destChainId as keyof typeof deploymentConfig].oft_address, 32)
            )
            await tx.wait()
            console.log('Peer Set in Source Chain:', tx)
        }

        const oft_contractAddress = deploymentConfig[destChainId as keyof typeof deploymentConfig].oft_address
        const lzEndpointIdOnDestChain = deploymentConfig[destChainId as keyof typeof deploymentConfig].lzEndpointId
        const oftContractInstance = getContractInstance(oft_contractAddress, OftABI as any)

        const isDestPeerAlready = await oftContractInstance.isPeer(
            lzEndpointIdOnDestChain,
            zeroPad(oftAdapterContractAddress, 32)
        )
        if (isDestPeerAlready) {
            console.log('Peer Already Set in Destination Chain')
        } else {
            const tx = await oftContractInstance.setPeer(
                lzEndpointIdOnDestChain,
                zeroPad(oftAdapterContractAddress, 32)
            )
            await tx.wait()
            console.log('Peer Set in Destination Chain:', tx)
        }
    } catch (error) {
        console.error(error)
    }
})

export default router
