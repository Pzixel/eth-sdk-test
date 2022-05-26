import hre from 'hardhat';
const { getChainId, getNamedAccounts, deployments: { deploy, getOrNull }, ethers } = hre;

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const tryRun = async (f: () => Promise<void>, n = 10) => {
    if (typeof f !== 'function') {
        throw Error('f is not a function');
    }
    for (let i = 0; ; i++) {
        try {
            return await f();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (error.message === 'Contract source code already verified' || error.message.includes('Reason: Already Verified')) {
                console.log('Contract already verified. Skipping verification');
                break;
            }
            console.error(error);
            await delay(1000);
            if (i > n) {
                throw new Error(`Couldn't verify deploy in ${n} runs`);
            }
        }
    }
};

async function idempotentDeploy (
    deployer: string, contractName: string,
    constructorArgs: unknown[],
    { deploymentName = contractName, validateDeployment = true }
) {
    const existingContract = await getOrNull(deploymentName);
    if (existingContract) {
        console.log(`Skipping deploy for existing contract ${contractName} (${deploymentName})`);
        return existingContract;
    }

    const contract = await deploy(deploymentName, {
        args: constructorArgs,
        from: deployer,
        contract: contractName,
    });

    if (validateDeployment) {
        await tryRun(() => hre.run('verify:verify', {
            address: contract.address,
            constructorArguments: constructorArgs,
        }));
    }

    return contract;
}

module.exports = async () => {
    console.log('running deploy script');
    const networkId = (await getChainId()).toString();
    console.log('network id ', networkId);
    const isHardhatNetwork = networkId === '31337' || networkId === '1337';

    const { deployer } = await getNamedAccounts();
    const test = await idempotentDeploy(deployer, 'Test', ["Test Coin", 'TKN'], { validateDeployment: !isHardhatNetwork });
    console.log('Deployed at', test.address);

    if (isHardhatNetwork) {
        const weth = await ethers.getContractAt('IWETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
        await weth.deposit({ value: ethers.utils.parseEther('500') });
    }
    console.log('Done');
};
