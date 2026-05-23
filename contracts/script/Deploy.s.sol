// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SocialTokenFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address platform = vm.envAddress("PLATFORM_ADDRESS");

        vm.startBroadcast(deployerKey);

        SocialTokenFactory factory = new SocialTokenFactory(platform);
        console.log("SocialTokenFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
