// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialTokenFactory {
    address public immutable platform;

    address[] public allTokens;
    mapping(address => address) public creatorToken;

    event TokenRegistered(
        address indexed creator,
        address indexed token,
        string name,
        string symbol
    );

    constructor(address _platform) {
        platform = _platform;
    }

    // Called by backend after deploying CreatorToken separately
    function registerToken(
        address creator,
        address token,
        string calldata name,
        string calldata symbol
    ) external {
        require(creatorToken[creator] == address(0), "Already registered");
        creatorToken[creator] = token;
        allTokens.push(token);
        emit TokenRegistered(creator, token, name, symbol);
    }

    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }
}
