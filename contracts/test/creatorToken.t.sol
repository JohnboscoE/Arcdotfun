// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SocialTokenFactory.sol";
import "../src/CreatorToken.sol";

// Minimal mock USDC for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract CreatorTokenTest is Test {
    SocialTokenFactory factory;
    MockUSDC usdc;

    address platform = address(0x1111111111111111111111111111111111111111);
    address creator = address(0x2222222222222222222222222222222222222222);
    address fan = address(0x3333333333333333333333333333333333333333);

    function setUp() public {
        usdc = new MockUSDC();
        factory = new SocialTokenFactory(address(usdc), platform);
    }

    function test_LaunchToken() public {
        vm.prank(creator);
        address tokenAddr = factory.launchToken("CryptoKing Token", "CKT");
        assertEq(factory.creatorToken(creator), tokenAddr);
        assertEq(factory.totalTokens(), 1);
    }

    function test_BuyTokens() public {
        // Creator launches token
        vm.prank(creator);
        address tokenAddr = factory.launchToken("CryptoKing Token", "CKT");
        CreatorToken token = CreatorToken(tokenAddr);

        // Give fan 100 USDC
        usdc.mint(fan, 100e6);

        // Fan approves and buys
        vm.startPrank(fan);
        usdc.approve(tokenAddr, 100e6);
        token.buy(10e6); // spend 10 USDC
        vm.stopPrank();

        // Fan should have creator tokens now
        assertGt(token.balanceOf(fan), 0);
    }

    function test_AccessTier() public {
        vm.prank(creator);
        address tokenAddr = factory.launchToken("CryptoKing Token", "CKT");
        CreatorToken token = CreatorToken(tokenAddr);

        usdc.mint(fan, 10000e6);

        vm.startPrank(fan);
        usdc.approve(tokenAddr, 10000e6);
        token.buy(2000e6); // buy enough to exceed 1000 tokens after fee
        vm.stopPrank();

        string memory tier = token.accessTier(fan);
        assertEq(tier, "diamond");
    }
}
