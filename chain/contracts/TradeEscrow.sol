pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol"; 

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract TradeEscrow is Ownable {

  /* using Chainlink for Chainlink.Request;

  address private oracle;
  bytes32 private jobId;
  uint256 private fee;
  
  // TODO: Determine required data?
  constructor() {
    setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
    setChainlinkOracle(0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656);
    jobId = '53f9755920cd451a8fe46f5087468395';
    fee = (1 * LINK_DIVISIBILITY) / 10;
  } */

  struct Deposit {
    address payable creator;
    address payable beneficiary;

    uint deposit;

    string beneficiary_steamid;
    string item_name;
    uint item_float;
    
    uint withdrawalrequest_timestamp;
    uint creation_timestamp;
    bool claimable;
  }

  mapping(address => Deposit[]) public deposits;

  // TODO: Clarify naming? beneficiary => seller

  function deposit(address _beneficiary, string calldata _beneficiary_steamid, string calldata _item_name, uint _item_float) external payable {
    deposits[msg.sender].push(Deposit(payable(msg.sender), payable(_beneficiary), msg.value, _beneficiary_steamid, _item_name, _item_float, 0, block.timestamp, false));
    //emit DepositFulfilled(_beneficiary, _beneficiary_steamid, _item_name, _item_float, msg.value, deposit_id);
  }

  function request_withdrawal(uint _id) external {
    deposits[msg.sender][_id].withdrawalrequest_timestamp = block.timestamp;
  }

  function get_withdrawalrequest_timestamp(address _owner, uint _id) external view returns (uint) {
    return deposits[_owner][_id].withdrawalrequest_timestamp;
  }

  function withdraw(uint _id) external {
    Deposit memory withdrawable_deposit = deposits[msg.sender][_id];
    require(withdrawable_deposit.creator == msg.sender, "INVALID OWNER");
    require(withdrawable_deposit.claimable == false, "The seller fulfilled his obligation"); // copywriting
    require(withdrawable_deposit.withdrawalrequest_timestamp != 0, "You need to request withdrawal first");
    require(block.timestamp > withdrawable_deposit.withdrawalrequest_timestamp + 10 minutes, "You need to wait 10 minutes after requesting withdrawal");

    delete(deposits[msg.sender][_id]);
    payable(msg.sender).transfer(withdrawable_deposit.deposit);
  }

  function claim(address _owner, uint _id) external {
    Deposit memory withdrawable_deposit = deposits[_owner][_id];
    require(block.timestamp < withdrawable_deposit.creation_timestamp + 7 days, "Can only claim within 7 days of deposit creation");
    require(msg.sender == withdrawable_deposit.beneficiary, "You can only claim as beneficiary of the deposit");

    delete(deposits[_owner][_id]);
    payable(msg.sender).transfer(withdrawable_deposit.deposit);
  }

  /*
  function request_claim(address _owner, uint _id) public returns (bytes32 requestId) {
    Chainlink.Request memory req = buildChainlinkRequest(
      jobId,
      address(this),
      this.fulfillMultipleParameters.selector
    );

    req.add('verificationURL', 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC');
    req.add('pathHasItem', 'hasItem');
    req.add('pathOwner', 'owner');
    req.add('pathID', 'id');

    sendChainlinkRequest(req, fee);
  }

  function fulfillMultipleParameters(
        bytes32 requestId,
        bool hasItem,
        string owner,
        uint id
    ) public recordChainlinkFulfillment(requestId) {
        deposits[owner][id].claimable = hasItem;
        emit RequestMultipleFulfilled(requestId, hasItem, owner, id);
  }

*/
  function get_claimable(address _owner, uint _id) external view returns (bool) {
    return deposits[_owner][_id].claimable;
  }

  // string beneficiary_steamid;
  //  string item_name;
  //  uint item_float;

  function get_beneficiary_steamid(address _owner, uint _id) external view returns (string memory) {
    return deposits[_owner][_id].beneficiary_steamid;
  }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}
