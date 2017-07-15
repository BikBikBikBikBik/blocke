const { Block, Transaction } = require('./models');

const piconero = 1000000000000;

class ChainRadarTypeMapper {
	mapAccount(account) {
		throw new 'Operation not supported.';
	}
	
	mapBlock(block) {
		return new Block(block.blockHeader.difficulty, block.blockHeader.hash, block.blockHeader.height, new Date(block.blockHeader.timestamp * 1000), block.transactions.length);
	}
	
	mapTransaction(transaction) {
		return new Transaction(transaction.header.totalInputsAmount / piconero, transaction.header.blockHash, [], [], new Date(transaction.header.timestamp * 1000));
	}
}

module.exports = new ChainRadarTypeMapper();