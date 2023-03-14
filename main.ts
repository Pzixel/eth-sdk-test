import { ethers } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const rpcUrl = process.env.MAINNET_RPC_URL;
    if (!rpcUrl) {
        throw new Error('Missing RPC url');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const blockTxs = await provider.getBlockWithTransactions(16826297);
    const requiredTx = blockTxs.transactions[101];
    console.log(requiredTx);

}

main();