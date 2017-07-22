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

class SiaTechClient extends ApiClientBase {
	constructor() {
		super('https://explore.sia.tech/explorer/');
	}
	
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash(blockId) {
		const self = this;
		
		return this.executeRequest(`blocks/${blockId}`, 'Block').then(function(res) {
			if (res.block.height.toString() === blockId) {
				return res.block;
			}
			
			return Promise.reject({blockId: blockId});
		}).catch(function(err) {
			if (typeof(err) === 'object' && err.hasOwnProperty('blockId')) {
				return self.executeRequest(`hashes/${err.blockId}`, 'Block');
			}
		}).then(function(res) {
			if (res.hasOwnProperty('hashtype') && res.hashtype === 'blockid') {
				return res.block;
			} else if (!res.hasOwnProperty('hashtype')) {
				return res;
			}
			
			return Promise.reject('Block not found.');
		});
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`hashes/${transactionHash}`, 'Transaction').then(function(res) {
			if (res.hashtype === 'transactionid') {
				return res;
			}
			
			return Promise.reject('Transaction not found.');
		});
	}
}

module.exports = new SiaTechClient();