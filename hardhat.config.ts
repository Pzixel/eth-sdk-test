import '@tenderly/hardhat-tenderly';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import { NetworksUserConfig } from 'hardhat/types';

dotenv.config();

if (process.env.MAINNET_RPC_URL == null) {
    throw new Error('Please specify MAINNET_RPC_URL in .env file');
}

const networks: NetworksUserConfig = {
    hardhat: {
        accounts: {
            accountsBalance: '100000041787096666882822',
        },
        forking: {
            url: process.env.MAINNET_RPC_URL,
//            blockNumber: 14800559,
        },
        chainId: 1337, // change to 1337 if attaching metamask to local hardhat node. See https://hardhat.org/metamask-issue.html
    },
};

function register (name: string, url?: string, privateKey?: string) {
    if (url && privateKey) {
        networks[name] = {
            url,
            accounts: [privateKey],
        };
        console.log(`Network '${name}' registered`);
    } else {
        console.log(`Network '${name}' not registered`);
    }
}

register('mainnet', process.env.MAINNET_RPC_URL, process.env.MAINNET_PRIVATE_KEY);
register('ropsten', process.env.ROPSTEN_PROJECT_SECRET, process.env.ROPSTEN_PRIVATE_KEY);
register('rinkeby', process.env.ROPSTEN_PROJECT_SECRET, process.env.ROPSTEN_PRIVATE_KEY);

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.13',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
        },
    },
    networks: networks,
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.MAINNET_ETHERSCAN_KEY,
        },
    },
    gasReporter: {
        enabled: true,
    },
    mocha: {
        timeout: 60000,
    },
    typechain: {
        target: 'ethers-v5',
    },
};

export default config;
