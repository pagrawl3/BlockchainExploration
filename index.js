const Web3 = require("web3");
const solc = require("solc");
const fs = require("fs");

class VotingContract {
	constructor(from, web3) {
		this.web3 = web3 || new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
		this.solidityCode = fs.readFileSync("Voting.sol").toString();
		this.compiledSolidityCode = solc.compile(this.solidityCode);
		this.abiDefinition = JSON.parse(this.compiledSolidityCode.contracts[":Voting"].interface);
		this.byteCode = this.compiledSolidityCode.contracts[":Voting"].bytecode;
		this.Contract = this.web3.eth.contract(this.abiDefinition);
		this.fromAccount = from;
	}

	deploy(users, cb) {
		this.deployedContract = this.Contract.new(
			users,
			{
				data: this.byteCode,
				from: this.fromAccount,
				gas: 4700000
			},
			(e, contract) => {
				if (contract.address) {
					this.contractInstance = this.Contract.at(contract.address);
					cb(contract);
				} else {
					console.log("MINING...");
				}
			}
		);
	}

	getVotesForUser(user) {
		return this.contractInstance.totalVotesFor.call(user).toLocaleString();
	}

	voteForUser(user) {
		return this.contractInstance.voteForCandidate(user, { from: this.fromAccount });
	}

	get accounts() {
		return this.web3.eth.accounts;
	}
}

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const myContract = new VotingContract(web3.eth.accounts[0], web3);

myContract.deploy(["Rama", "Nick", "Jose"], contract => {
	console.log(myContract.getVotesForUser("Rama"));
	console.log(myContract.voteForUser("Rama"));
	console.log(myContract.getVotesForUser("Rama"));
	console.log(myContract.voteForUser("Rama"));
	console.log(myContract.getVotesForUser("Rama"));
	console.log(myContract.voteForUser("Rama"));
	console.log(myContract.getVotesForUser("Rama"));
});
