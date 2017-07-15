const ApiClientBase = require('./api-client-base');
const request = require('request-promise');

class MoneroBlocks extends ApiClientBase {
	constructor() {
		super('http://moneroblocks.info/api/');
	}
	
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(block) {
		return this.executeRequest(`get_block_data/${block}`, 'Block').then(function(res) {
			//The API doesn't seem to be populating all of the fields in the response here
			return res.block_data;
		});
	}
	
	getBlockHeaderByNumberOrHash(block) {
		return this.executeRequest(`get_block_header/${block}`, 'Block header').then(function(res) {
			return res.block_header;
		});
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`get_transaction_data/${transaction}`, 'Transaction').then(function(res) {
			return res.transaction_data;
		});
	}
}

module.exports = new MoneroBlocks();