// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Extended {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CreatorToken is ERC20, Ownable {
    address public immutable usdc;
    address public immutable creator;
    address public immutable platform;

    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BASE_PRICE        = 1e6; // 1 USDC
    uint256 public constant PRICE_SLOPE       = 1000;

    // USDC reserve held by THIS contract for buybacks
    uint256 public reserve;

    event TokensPurchased(address indexed fan, uint256 usdcSpent,    uint256 tokensReceived);
    event TokensSold     (address indexed fan, uint256 tokensSold,   uint256 usdcReceived);

    constructor(
        string memory _name,
        string memory _symbol,
        address _creator,
        address _usdc,
        address _platform
    ) ERC20(_name, _symbol) Ownable(_creator) {
        creator  = _creator;
        usdc     = _usdc;
        platform = _platform;
    }

    function currentPrice() public view returns (uint256) {
        return BASE_PRICE + (totalSupply() / 1e18) * PRICE_SLOPE;
    }

    function buy(uint256 usdcAmount) external {
        require(usdcAmount > 0, "Must send USDC");

        uint256 fee           = (usdcAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 afterFee      = usdcAmount - fee;

        // Split: 50% to creator, 50% to reserve for buybacks
        uint256 toCreator     = afterFee / 2;
        uint256 toReserve     = afterFee - toCreator;

        uint256 price         = currentPrice();
        uint256 tokensOut     = (afterFee * 1e18) / price;
        require(tokensOut > 0, "Amount too small");

        IERC20Extended(usdc).transferFrom(msg.sender, creator,  toCreator);
        IERC20Extended(usdc).transferFrom(msg.sender, platform, fee);
        IERC20Extended(usdc).transferFrom(msg.sender, address(this), toReserve);

        reserve += toReserve;
        _mint(msg.sender, tokensOut);

        emit TokensPurchased(msg.sender, usdcAmount, tokensOut);
    }

    function sell(uint256 tokenAmount) external {
        require(tokenAmount > 0,                      "Must sell tokens");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");

        uint256 price    = currentPrice();
        uint256 usdcOut  = (tokenAmount * price) / 1e18;
        uint256 fee      = (usdcOut * PLATFORM_FEE_BPS) / 10000;
        uint256 fanAmount = usdcOut - fee;

        require(reserve >= fanAmount + fee, "Insufficient reserve");

        _burn(msg.sender, tokenAmount);

        reserve -= (fanAmount + fee);

        IERC20Extended(usdc).transfer(msg.sender, fanAmount);
        IERC20Extended(usdc).transfer(platform,   fee);

        emit TokensSold(msg.sender, tokenAmount, fanAmount);
    }

    function accessTier(address fan) external view returns (string memory) {
        uint256 bal = balanceOf(fan) / 1e18;
        if (bal >= 1000) return "diamond";
        if (bal >= 100)  return "gold";
        if (bal >= 10)   return "silver";
        return "none";
    }

    function getReserve() external view returns (uint256) {
        return reserve;
    }
}