const ApiClientBase = require('./api-client-base');
const request = require('request-promise');

const _apiBaseAddress = 'https://chain.so/api/v2/';
let _network = undefined;
const _supportedNetworks = [ 'BTC', 'DASH', 'DOGE', 'LTC' ];

class SoChain extends ApiClientBase {
	constructor(network) {
		super(_apiBaseAddress);
		
		let formattedNetwork = network.trim().toUpperCase();
		if (_supportedNetworks.indexOf(formattedNetwork) === -1) {
			throw `Unsupported network: ${network}`;
		} else {
			_network = formattedNetwork;
		}
	}
	
	getAccount(account) {
		return this.executeRequest(`get_address_balance/${_network}/${account}`, 'Account').then(function(res) {
			return res.data;
		});
	}
	
	getBlockByNumberOrHash(block) {
		return this.executeRequest(`get_block/${_network}/${block}`, 'Block').then(function(res) {
			return res.data;
		});
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`get_tx/${_network}/${transaction}`, 'Transaction').then(function(res) {
			return res.data;
		});
	}
}

module.exports = SoChain;