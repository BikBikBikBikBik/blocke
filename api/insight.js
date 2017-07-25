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

const _insightApiBaseAddressMap = {
	dcr: 'https://mainnet.decred.org/api/',
	kmd: 'http://kmd.explorer.supernet.org/api/'
};

class InsightClient extends ApiClientBase {
	constructor(network) {
		let formattedNetwork = network.trim().toLowerCase();
		if (!_insightApiBaseAddressMap.hasOwnProperty(formattedNetwork)) {
			throw new Error(`Unsopported network: ${network}`);
		}
		
		super(_insightApiBaseAddressMap[formattedNetwork]);
	}
	
	getAccount(accountAddress) {
		return this.executeRequest(`addr/${accountAddress}`, 'Account');
	}
	
	getBlockByNumberOrHash(blockId) {
		//A block hash may be cast to a valid (different) block height
		// by the API so try blockId as a block hash first.
		return this.executeRequest(`block/${blockId}`, 'Block').catch((err) => this.executeRequest(`block-index/${blockId}`, 'Block'))
		.then((res) => {
			if (res.hasOwnProperty('blockHash')) {
				return this.executeRequest(`block/${res.blockHash}`, 'Block');
			}
			
			return res;
		}).then((res) => {
			if (res.hash !== blockId && res.height.toString() !== blockId) {
				return Promise.reject('Block not found.');
			}
			
			return res;
		});
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`tx/${transactionHash}`, 'Transaction');
	}
}

module.exports = InsightClient;