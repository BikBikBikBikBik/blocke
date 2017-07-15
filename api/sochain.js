const ApiClientBase = require('./api-client-base');
const request = require('request-promise');

let _soChainNetwork = undefined;
const _soChainSupportedNetworks = [ 'BTC', 'DASH', 'DOGE', 'LTC' ];

class SoChain extends ApiClientBase {
	constructor(network) {
		super('https://chain.so/api/v2/');
		
		let formattedNetwork = network.trim().toUpperCase();
		if (_soChainSupportedNetworks.indexOf(formattedNetwork) === -1) {
			throw `Unsupported network: ${network}`;
		} else {
			_soChainNetwork = formattedNetwork;
		}
	}
	
	getAccount(account) {
		return this.executeRequest(`get_address_balance/${_soChainNetwork}/${account}`, 'Account').then(function(res) {
			return res.data;
		});
	}
	
	getBlockByNumberOrHash(block) {
		return this.executeRequest(`get_block/${_soChainNetwork}/${block}`, 'Block').then(function(res) {
			return res.data;
		});
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`get_tx/${_soChainNetwork}/${transaction}`, 'Transaction').then(function(res) {
			return res.data;
		});
	}
}

module.exports = SoChain;