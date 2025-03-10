import 'dotenv/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-verify'
import '@openzeppelin/hardhat-upgrades'

const ACCOUNTS = process.env.DEPLOYER_ACCOUNT_PRIV_KEY ? [`${process.env.DEPLOYER_ACCOUNT_PRIV_KEY}`] : []

module.exports = {
    defaultNetwork: 'hardhat',
    gasReporter: {
        enabled: false,
    },
    networks: {
        hardhat: { chainId: 31337 },
        bnbTestnet: {
            chainId: 97,
            url: 'https://bsc-testnet.public.blastapi.io',
            accounts: ACCOUNTS,
        },
        opbnbTestnet: {
            chainId: 5611,
            url: 'https://opbnb-testnet-rpc.bnbchain.org',
            accounts: ACCOUNTS,
        },
        bnbMainnet: {
            chainId: 56,
            url: 'https://bsc.nodereal.io', // "https://binance.llamarpc.com", // "https://binance.llamarpc.com", // "https://bsc.drpc.org", // "https://bsc-pokt.nodies.app", // "https://binance.llamarpc.com",
            accounts: ACCOUNTS,
        },
        polygon: {
            chainId: 137,
            url: 'https://polygon-mainnet.public.blastapi.io', // "https://polygon-pokt.nodies.app",
            accounts: ACCOUNTS,
        },
        sepolia: {
            chainId: 11155111,
            url: 'https://eth-sepolia.public.blastapi.io',
            accounts: ACCOUNTS,
        },
        ethereum: {
            chainId: 1,
            url: 'https://eth.llamarpc.com',
            accounts: ACCOUNTS,
        },
        manta: {
            chainId: 169,
            url: 'https://pacific-rpc.manta.network/http',
            accounts: ACCOUNTS,
        },
        mantaSepolia: {
            chainId: 3441006,
            url: 'https://pacific-rpc.sepolia-testnet.manta.network/http',
            accounts: ACCOUNTS,
        },
        fantom: {
            chainId: 250,
            url: 'https://rpcapi.fantom.network',
            accounts: ACCOUNTS,
        },
        optimism: {
            chainId: 10,
            url: 'https://op-pokt.nodies.app',
            accounts: ACCOUNTS,
        },
        berachain_testnet: {
            chainId: 80084,
            url: 'https://bartio.rpc.berachain.com/',
            accounts: ACCOUNTS,
        },
        base: {
            chainId: 8453,
            url: 'https://base.drpc.org',
            accounts: ACCOUNTS,
        },
        baseSepolia: {
            chainId: 84532,
            url: 'https://sepolia.base.org/',
            accounts: ACCOUNTS,
        },
        sonicTestnet: {
            url: 'https://rpc.blaze.soniclabs.com',
            chainId: 57054,
            accounts: ACCOUNTS,
        },
        avalanche: {
            chainId: 43114,
            url: 'https://avalanche.drpc.org',
            accounts: ACCOUNTS,
        },
        arbitrum: {
            chainId: 42161,
            url: 'https://arbitrum.llamarpc.com',
            accounts: ACCOUNTS,
        },
        polygonAmoy: {
            chainId: 80002,
            url: 'https://rpc-amoy.polygon.technology',
            accounts: ACCOUNTS,
        },
        holesky: {
            chainId: 17000,
            url: 'https://rpc.ankr.com/eth_holesky',
            accounts: ACCOUNTS,
        },
        bscTestnet: {
            chainId: 97,
            url: 'https://bsc-testnet.bnbchain.org/',
            accounts: ACCOUNTS,
        },
        mantleSepolia: {
            chainId: 5003,
            url: 'https://rpc.sepolia.mantle.xyz',
            accounts: ACCOUNTS,
        },
    },
    etherscan: {
        apiKey: {
            iotaEvmMainnet: '3227102f-dd06-4329-b1e2-ab1e2f127d6e',
            baseSepolia: '8VP9YW357XEY3FW4T5HEM84BNHV15KYHW6',
        },
        customChains: [
            {
                network: 'iotaEvmMainnet',
                chainId: 8822,
                urls: {
                    apiURL: 'https://explorer.evm.iota.org/api',
                    browserURL: 'https://explorer.evm.iota.org',
                },
            },
            {
                network: 'shimmerEvmMainnet',
                chainId: 148,
                urls: {
                    apiURL: 'https://explorer.evm.shimmer.network/api',
                    browserURL: 'https://explorer.evm.shimmer.network',
                },
            },
            {
                network: 'bnbMainnet',
                chainId: 56,
                urls: {
                    apiURL: 'https://api.bscscan.com/api',
                    browserURL: 'https://bscscan.com',
                },
            },
            {
                network: 'polygon',
                chainId: 137,
                urls: {
                    apiURL: 'https://api.polygonscan.com/api',
                    browserURL: 'https://polygonscan.com',
                },
            },
            {
                network: 'baseSepolia',
                chainId: 84532,
                urls: {
                    apiURL: 'https://api-sepolia.basescan.org',
                    browserURL: 'https://sepolia.basescan.org/',
                },
            },
            {
                network: 'ethereum',
                chainId: 1,
                urls: {
                    apiURL: 'https://api.etherscan.io/api',
                    browserURL: 'https://etherscan.io',
                },
            },
            {
                network: 'sonicTestnet',
                chainId: 57054,
                urls: {
                    apiURL: 'https://api-testnet.sonicscan.org/api',
                    browserURL: 'https://testnet.sonicscan.org',
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
    solidity: {
        version: '0.8.22',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    allowUnlimitedContractSize: true,
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
}
