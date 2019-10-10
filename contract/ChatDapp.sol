pragma solidity >=0.4.16 <0.6.0;

contract ChatDapp {
    struct Message {
        address sender;
        string message;
        uint256 timestamp;
    }
    uint userCount = 0;

    mapping(address => string) addressToUsername;
    event newMessageEvent(address indexed sender, string message, uint256 timestamp);

    function writeMessage(string memory message) public {
        emit newMessageEvent(msg.sender, message, block.timestamp);
    }

    function createUser(string calldata name) external {
        userCount++;
        addressToUsername[msg.sender] = name;
    }

    function getUserCount() public view returns (uint) {
        return userCount;
    }

    function getUsernameForAddress(address userAddress) external view returns (string memory) {
        return addressToUsername[userAddress];
    }
}