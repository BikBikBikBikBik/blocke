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

class EtherchainClient {
	getAccount(account) {
		let formattedAccount = account.startsWith('0x') ? account : '0x' + account;
		
		return executeRequest(`account/${formattedAccount}`, 'Account');
	}
	
	getBlockByNumberOrHash(block) {
		return executeRequest(`block/${block}`, 'Block').then(function(res) {
			//There is currently a bug in the API that returns block #0 for many invalid block hashes/numbers
			const formattedBlock = block.trim().toLowerCase();
			if (res.hash.toLowerCase() !== formattedBlock && res.number.toString() !== formattedBlock) {
				return Promise.reject('Block not found.');
			}
			
			return res;
		});
	}
	
	getTransaction(transaction) {
		return executeRequest(`tx/${transaction}`, 'Transaction');
	}
}

module.exports = new EtherchainClient();