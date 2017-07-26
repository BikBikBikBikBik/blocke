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

class SiaTechClient extends ApiClientBase {
	constructor() {
		super('https://explore.sia.tech/explorer/');
	}
	
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`blocks/${blockId}`, 'Block').then((res) => {
			if (res.block.height.toString() === blockId) {
				return res.block;
			}
			
			return this.executeRequest(`hashes/${blockId}`, 'Block');
		}).then((res) => {
			if (res === undefined) {
				return Promise.reject('Block not found.');
			}
			if (res.hasOwnProperty('hashtype') && res.hashtype === 'blockid') {
				return res.block;
			}
			
			return res;
		});
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`hashes/${transactionHash}`, 'Transaction').then((res) => {
			if (res.hashtype === 'transactionid') {
				return res;
			}
			
			return Promise.reject('Transaction not found.');
		});
	}
}

module.exports = new SiaTechClient();