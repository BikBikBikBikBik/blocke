const _ = require('underscore');

const piconero = 1000000000000;

class ChainRadarTypeMapper {
	mapAccount(account) {
		throw new 'Operation not supported.';
	}
	
	mapBlock(block) {
		return {
			difficulty: block.blockHeader.difficulty,
			hash: block.blockHeader.hash,
			number: block.blockHeader.height,
			time: new Date(block.blockHeader.timestamp * 1000),
			transactionCount: block.transactions.length
		};
	}
	
	mapTransaction(transaction) {
		return {
			amountSent: transaction.header.totalInputsAmount / piconero,
			blockHash: transaction.header.blockHash,
			recipients: [],
			senders: [],
			time: new Date(transaction.header.timestamp * 1000)
		};
	}
}

module.exports = new ChainRadarTypeMapper();