import { initiateDeveloperControlledWalletsClient, } from "@circle-fin/developer-controlled-wallets";
import { initiateSmartContractPlatformClient, } from "@circle-fin/smart-contract-platform";
const walletClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});
const contractClient = initiateSmartContractPlatformClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});
function requireEnv(name) {
    const value = process.env[name];
    if (!value || value.includes("your_")) {
        throw new Error(`${name} is missing or still contains a placeholder value`);
    }
    return value;
}
function requireEvmAddress(name) {
    const value = requireEnv(name);
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw new Error(`${name} must be a valid EVM address starting with 0x`);
    }
    return value;
}
export async function createCreatorWallet(creatorName) {
    const walletSet = await walletClient.createWalletSet({
        name: `${creatorName} WalletSet`,
    });
    const walletSetId = walletSet.data?.walletSet?.id;
    if (!walletSetId) {
        throw new Error("Wallet set creation failed: no wallet set id returned");
    }
    const wallet = await walletClient.createWallets({
        blockchains: ["ARC-TESTNET"],
        count: 1,
        walletSetId,
        accountType: "SCA",
    });
    return wallet.data?.wallets?.[0];
}
export async function deployCreatorToken(tokenName, symbol, creatorAddress) {
    const platformWalletId = requireEnv("PLATFORM_WALLET_ID");
    const platformWalletAddress = requireEvmAddress("PLATFORM_WALLET_ADDRESS");
    const response = await contractClient.deployContractTemplate({
        id: "a1b74add-23e0-4712-88d1-6b3009e85a86",
        blockchain: "ARC-TESTNET",
        name: `${tokenName}Contract`,
        walletId: platformWalletId,
        templateParameters: {
            name: tokenName,
            symbol,
            defaultAdmin: creatorAddress,
            primarySaleRecipient: creatorAddress,
            platformFeeRecipient: platformWalletAddress,
            platformFeePercent: 0.025,
        },
        fee: {
            type: "level",
            config: { feeLevel: "MEDIUM" },
        },
    });
    return {
        contractId: response.data?.contractIds?.[0],
        transactionId: response.data?.transactionId,
    };
}
export async function getTransactionStatus(transactionId) {
    const response = await walletClient.getTransaction({
        id: transactionId,
    });
    return response.data?.transaction;
}
export async function getContractAddress(contractId) {
    const response = await contractClient.getContract({
        id: contractId,
    });
    return response.data?.contract?.contractAddress;
}
export async function getWalletBalance(walletId) {
    const response = await walletClient.getWalletTokenBalance({
        id: walletId,
    });
    return response.data?.tokenBalances;
}
