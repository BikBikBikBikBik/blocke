const request = require('request-promise');
const apiBaseAddress = 'http://moneroblocks.info/api/';

function executeRequest(uriSuffix, objectName) {
	let requestOptions = {
		json: true,
		uri: `${apiBaseAddress}${uriSuffix}`
	};
		
	return request(requestOptions).then(function(res) {
		return res;
	}).catch(function(err) {
		return Promise.reject(`An error occurred while attempting to retrieve the ${objectName}.`);
	});
}

class MoneroBlocks {
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(block) {
		return executeRequest(`get_block_data/${block}`, 'block').then(function(res) {
			//The API doesn't seem to be populating all of the fields in the response here
			return res.block_data;
		});
	}
	
	getBlockHeaderByNumberOrHash(block) {
		return executeRequest(`get_block_header/${block}`, 'block header').then(function(res) {
			return res.block_header;
		});
	}
	
	getTransaction(transaction) {
		return executeRequest(`get_transaction_data/${transaction}`, 'transaction').then(function(res) {
			return res.transaction_data;
		});
	}
}

module.exports = new MoneroBlocks();