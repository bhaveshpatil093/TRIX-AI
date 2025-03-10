const CHAIN_CONFIG: any = {
    SONIC_TESTNET: {
        lzEndpointOnCurrentChain: '0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff',
        lzEndpointIdOnCurrentChain: 40349,

        // https://docs.layerzero.network/v2/developers/evm/technical-reference/dvn-addresses#layerzero-labs
        requiredDVNsOnCurrentChain: [
            '0x88b27057a9e00c5f05dda29241027aff63f9e6e0', // LayerZero Labs
        ],
        optionalDVNsOnCurrentChain: [], // if specifying optional DVN, the setConfig tx will get reverted, why?

        // From the deployed endpoint, take the SendLib302 and ReceiveLib302
        // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
        sendLibAddressOnCurrentChain: '0xd682ECF100f6F4284138AA925348633B0611Ae21',
        receiveLibAddressOnCurrentChain: '0xcF1B0F4106B0324F96fEfcC31bA9498caa80701C',

        confirmationsOnCurrentChain: 0, // will get default confirmations
    },
    BASE_SEPOLIA: {
        lzEndpointOnCurrentChain: '0x6EDCE65403992e310A62460808c4b910D972f10f',
        lzEndpointIdOnCurrentChain: 40245,

        // https://docs.layerzero.network/v2/developers/evm/technical-reference/dvn-addresses#layerzero-labs
        requiredDVNsOnCurrentChain: [
            '0xe1a12515f9ab2764b887bf60b923ca494ebbb2d6', // LayerZero Labs
        ],
        optionalDVNsOnCurrentChain: [], // if specifying optional DVN, the setConfig tx will get reverted, why?

        // From the deployed endpoint, take the SendLib302 and ReceiveLib302
        // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
        sendLibAddressOnCurrentChain: '0xC1868e054425D378095A003EcbA3823a5D0135C9',
        receiveLibAddressOnCurrentChain: '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d',

        confirmationsOnCurrentChain: 0, // will get default confirmations
    },
    MANTLE_SEPOLIA: {
        lzEndpointOnCurrentChain: '0x6EDCE65403992e310A62460808c4b910D972f10f',
        lzEndpointIdOnCurrentChain: 40245,

        // https://docs.layerzero.network/v2/developers/evm/technical-reference/dvn-addresses#layerzero-labs
        requiredDVNsOnCurrentChain: [
            '0xe1a12515f9ab2764b887bf60b923ca494ebbb2d6', // LayerZero Labs
        ],
        optionalDVNsOnCurrentChain: [], // if specifying optional DVN, the setConfig tx will get reverted, why?

        // From the deployed endpoint, take the SendLib302 and ReceiveLib302
        // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
        sendLibAddressOnCurrentChain: '0xC1868e054425D378095A003EcbA3823a5D0135C9',
        receiveLibAddressOnCurrentChain: '0x12523de19dc41c91F7d2093E0CFbB76b17012C8d',

        confirmationsOnCurrentChain: 0, // will get default confirmations
    },
}

const PATHWAY_CONFIG = (srcChain: string, destChain: string) => {
    if (!CHAIN_CONFIG[srcChain]) {
        throw new Error(`Chain config for ${srcChain} missing`)
    } else if (!CHAIN_CONFIG[destChain]) {
        throw new Error(`Chain config for ${destChain} missing`)
    }

    return {
        ...CHAIN_CONFIG[srcChain],

        lzEndpointIdOnRemoteChain: CHAIN_CONFIG[destChain].lzEndpointIdOnCurrentChain,
    }
}

export default PATHWAY_CONFIG
