const _ = require('underscore');

class SoChainTypeMapper {
	mapAccount(account) {
		return {
			address: account.address,
			confirmedBalance: parseFloat(account.confirmed_balance),
			unconfirmedBalance: parseFloat(account.unconfirmed_balance)
		};
	}
	
	mapBlock(block) {
		return {
			difficulty: parseFloat(block.mining_difficulty),
			hash: block.blockhash,
			number: block.block_no,
			time: new Date(block.time * 1000),
			transactionCount: block.txs.length
		};
	}
	
	mapTransaction(transaction) {
		return {
			amountSent: _.reduce(transaction.inputs, (total, input) => total + parseFloat(input.value), 0),
			blockHash: transaction.blockhash,
			recipients: _.map(transaction.outputs, (output) => output.address),
			senders: _.map(transaction.inputs, (input) => input.address),
			time: new Date(transaction.time * 1000),
		};
	}
}

module.exports = new SoChainTypeMapper();