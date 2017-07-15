const request = require('request-promise');

function executeRequest(uriSuffix, objectName) {
	let requestOptions = {
		json: true,
		uri: `https://etherchain.org/api/${uriSuffix}`
	};
		
	return request(requestOptions).catch(function(err) {
		return Promise.reject(`An error occurred while attempting to retrieve the ${objectName.toLowerCase()}.`);
	}).then(function(res) {
		if (res.data.length === 1) {
			return res.data[0];
		}
		
		return Promise.reject(`${objectName} not found.`);
	});
}

class Etherchain {
	getAccount(account) {
		return executeRequest(`account/${account}`, 'Account');
	}
	
	getBlockByNumberOrHash(block) {
		return executeRequest(`block/${block}`, 'Block');
	}
	
	getTransaction(transaction) {
		return executeRequest(`tx/${transaction}`, 'Transaction');
	}
}

module.exports = new Etherchain();