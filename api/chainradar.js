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
const request = require('request-promise');

const _chainRadarSupportedNetworks = [ 'aeon', 'xmr' ];

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
			throw new Error(`Unsupported network: ${network}`);
		}
		if (formattedNetwork === 'xmr') {
			//ChainRadar uses 'mro' as the symbol for XMR
			formattedNetwork = 'mro';
		}
		
		this._network = formattedNetwork;
	}
	
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`${this._network}/blocks/${blockId}/full`, 'Block').then(handleResponseErrors);
	}
	
	getTransaction(transaction) {
		return this.executeRequest(`${this._network}/transactions/${transaction}/full`, 'Transaction').then(handleResponseErrors);
	}
}

module.exports = ChainRadarClient;