import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { initiateSmartContractPlatformClient } from "@circle-fin/smart-contract-platform";
// Initialize both Circle SDK clients
const walletClient = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});
const contractClient = initiateSmartContractPlatformClient({
    apiKey: process.env.CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});
// ─── Wallet operations ────────────────────────────────────────────
// Create a new dev-controlled wallet for a creator
export async function createCreatorWallet(creatorName) {
    // First create a wallet set
    const walletSet = await walletClient.createWalletSet({
        name: `${creatorName} WalletSet`,
    });
    // Then create the wallet inside it
    const wallet = await walletClient.createWallets({
        blockchains: ["ARC-TESTNET"],
        count: 1,
        walletSetId: walletSet.data?.walletSet?.id ?? "",
        accountType: "SCA", // Smart Contract Account — gas is sponsored
    });
    return wallet.data?.wallets?.[0];
}
// ─── Contract operations ──────────────────────────────────────────
// Deploy a new ERC-20 creator token using Circle's audited template
export async function deployCreatorToken(tokenName, symbol, creatorAddress) {
    const response = await contractClient.deployContractTemplate({
        id: "a1b74add-23e0-4712-88d1-6b3009e85a86", // Circle ERC-20 template
        blockchain: "ARC-TESTNET",
        name: `${tokenName}Contract`,
        walletId: process.env.PLATFORM_WALLET_ID, // platform pays gas
        templateParameters: {
            name: tokenName,
            symbol: symbol,
            defaultAdmin: creatorAddress,
            primarySaleRecipient: creatorAddress,
            platformFeeRecipient: process.env.PLATFORM_WALLET_ADDRESS,
            platformFeePercent: 0.025, // 2.5% platform fee
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
// Check the status of any transaction
export async function getTransactionStatus(transactionId) {
    const response = await walletClient.getTransaction({
        id: transactionId,
    });
    return response.data?.transaction;
}
// Get contract address after deployment completes
export async function getContractAddress(contractId) {
    const response = await contractClient.getContract({
        id: contractId,
    });
    return response.data?.contract?.contractAddress;
}
// Get wallet token balance
export async function getWalletBalance(walletId) {
    const response = await walletClient.getWalletTokenBalance({
        id: walletId,
    });
    return response.data?.tokenBalances;
}
