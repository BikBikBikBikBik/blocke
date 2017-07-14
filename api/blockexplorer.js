const request = require('request-promise');
const apiBaseAddress = 'https://blockexplorer.com/api/';

function executeRequest(uriSuffix, objectName) {
	let requestOptions = {
		json: true,
		uri: `${apiBaseAddress}${uriSuffix}`
	};
		
	return request(requestOptions).then(function(res) {
		return res;
	}).catch(function(err) {
		if (err.statusCode === 400 || err.statusCode === 404) {
			return Promise.reject(`${objectName} not found.`);
		}
		
		return Promise.reject(`An error occurred while attempting to retrieve the ${objectName.toLowerCase()}.`);
	});
}

class BlockExplorer {
	getAccount(account) {
		return executeRequest(`addr/${account}`, 'Account');
	}
	
	getBlockByNumberOrHash(block) {
		function runExecuteBlockRequest(blockHash) {
			return executeRequest(`block/${blockHash}`, 'Block');
		}
		
		if (!isNaN(block)) {
			return executeRequest(`block-index/${block}`, 'Block').then(function(res) {
				return runExecuteBlockRequest(res.blockHash);
			});
		} else {
			return runExecuteBlockRequest(block);
		}
	}
	
	getTransaction(transaction) {
		return executeRequest(`tx/${transaction}`, 'Transaction');
	}
}

module.exports = new BlockExplorer();