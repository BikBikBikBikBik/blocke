const ApiClientBase = require('./api-client-base');
const request = require('request-promise');

const _chainRadarSupportedNetworks = [ 'xmr' ];

function handleResponseErrors(res) {
	if (res.hasOwnProperty('code')) {
		let errorMessage = 'An unknown error has occurred.';

		switch (res.code) {
			case 'ApiNotAvailable':
				errorMessage = 'Blockchain explorer not available right now, please try again later.';
			break;

			case 'RequestLimitExceeded':
				errorMessage = res.message;
			break;
		}

		return Promise.reject(errorMessage);
	}

	return res;
}

class ChainRadarClient extends ApiClientBase {
	constructor(network) {
		super('http://chainradar.com/api/v1/');
		
		let formattedNetwork = network.trim().toLowerCase();
		if (_chainRadarSupportedNetworks.indexOf(formattedNetwork) === -1) {
			throw `Unsupported network: ${network}`;
		}
		if (formattedNetwork === 'xmr') {
			//ChainRadar uses 'mro' as the symbol for XMR
			formattedNetwork = 'mro';
		}
		
		this._network = formattedNetwork;
	}
	
	getAccount(account) {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(block) {
		return this.executeRequest(`${this._network}/blocks/${block}/full`, 'Block').then(handleResponseErrors);
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`${this._network}/transactions/${transaction}/full`, 'Transaction').then(handleResponseErrors);
	}
}

module.exports = ChainRadarClient;