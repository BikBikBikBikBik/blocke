/*
Copyright (C) 2017 BikBikBikBikBik

This file is part of blocke.

blocke is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

blocke is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with blocke.  If not, see <http://www.gnu.org/licenses/>.
*/
const ApiClientBase = require('./api-client-base');

const _soChainSupportedNetworks = [ 'BTC', 'DASH', 'DOGE', 'LTC' ];

class SoChainClient extends ApiClientBase {
	constructor(network) {
		super('https://chain.so/api/v2/');
		
		let formattedNetwork = network.trim().toUpperCase();
		if (_soChainSupportedNetworks.indexOf(formattedNetwork) === -1) {
			throw new Error(`Unsupported network: ${network}`);
		}
		
		this._network = formattedNetwork;
	}
	
	getAccount(accountAddress) {
		return this.executeRequest(`get_address_balance/${this._network}/${accountAddress}`, 'Account').then(function(res) {
			return res.data;
		});
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`get_block/${this._network}/${blockId}`, 'Block').then(function(res) {
			return res.data;
		});
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`get_tx/${this._network}/${transactionHash}`, 'Transaction').then(function(res) {
			return res.data;
		});
	}
}

module.exports = SoChainClient;