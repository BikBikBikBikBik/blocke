const ApiClientBase = require('./api-client-base');
const request = require('request-promise');

const _soChainSupportedNetworks = [ 'BTC', 'DASH', 'DOGE', 'LTC' ];

class SoChain extends ApiClientBase {
	constructor(network) {
		super('https://chain.so/api/v2/');
		
		let formattedNetwork = network.trim().toUpperCase();
		if (_soChainSupportedNetworks.indexOf(formattedNetwork) === -1) {
			throw `Unsupported network: ${network}`;
		} else {
			this._network = formattedNetwork;
		}
	}
	
	getAccount(account) {
		return this.executeRequest(`get_address_balance/${this._network}/${account}`, 'Account').then(function(res) {
			return res.data;
		});
	}
	
	getBlockByNumberOrHash(block) {
		return this.executeRequest(`get_block/${this._network}/${block}`, 'Block').then(function(res) {
			return res.data;
		});
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`get_tx/${this._network}/${transaction}`, 'Transaction').then(function(res) {
			return res.data;
		});
	}
}

module.exports = SoChain;