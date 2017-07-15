const { Account, Block, Transaction } = require('./models');

const weiPerEther = 1000000000000000000;

class EtherchainTypeMapper {
	mapAccount(account) {
		return new Account(account.address, account.balance / weiPerEther);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.number, new Date(block.time), block.tx_count);
	}
	
	mapTransaction(transaction) {
		return new Transaction(transaction.amount / weiPerEther, transaction.blockHash, transaction.recipient, transaction.sender, new Date(transaction.time));
	}
}

module.exports = new EtherchainTypeMapper();