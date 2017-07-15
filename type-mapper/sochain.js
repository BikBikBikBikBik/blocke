const { Account, Block, Transaction } = require('./models');
const _ = require('underscore');

class SoChainTypeMapper {
	mapAccount(account) {
		return new Account(account.address, parseFloat(account.confirmed_balance), parseFloat(account.unconfirmed_balance));
	}
	
	mapBlock(block) {
		return new Block(parseFloat(block.mining_difficulty), block.blockhash, block.block_no, new Date(block.time * 1000), block.txs.length);
	}
	
	mapTransaction(transaction) {
		return new Transaction(_.reduce(transaction.inputs, (total, input) => total + parseFloat(input.value), 0),
			transaction.blockhash, _.map(transaction.outputs, (output) => output.address),
			_.map(transaction.inputs, (input) => input.address), new Date(transaction.time * 1000));
	}
}

module.exports = new SoChainTypeMapper();