const weiPerEther = 1000000000000000000;

class EtherchainTypeMapper {
	mapAccount(account) {
		return {
			address: account.address,
			confirmedBalance: account.balance / weiPerEther,
			unconfirmedBalance: 0
		};
	}
	
	mapBlock(block) {
		return {
			difficulty: block.difficulty,
			hash: block.hash,
			number: block.number,
			time: new Date(block.time),
			transactionCount: block.tx_count
		};
	}
	
	mapTransaction(transaction) {
		return {
			amountSent: transaction.amount / weiPerEther,
			blockHash: transaction.blockHash,
			recipients: [transaction.recipient],
			senders: [transaction.sender],
			time: new Date(transaction.time),
		};
	}
}

module.exports = new EtherchainTypeMapper();