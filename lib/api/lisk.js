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

function handleResponseErrors(res, objectName) {
	if (res.success === false) {
		return Promise.reject(`${objectName} not found.`);
	}
	
	return res;
}

class LiskClient extends ApiClientBase {
	constructor() {
		super('https://explorer.lisk.io/api/');
	}
	
	getAccount(accountAddress) {
		return this.executeRequest(`getAccount?address=${accountAddress}`, 'Account').then((res) => handleResponseErrors(res, 'Account'));
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`getBlock?blockId=${blockId}`, 'Block').then((res) => {
			if (res.success === false) {
				return this.executeRequest(`search?id=${blockId}`, 'Block');
			}
			
			return res;
		}).then((res) => {
			if (res.type === 'block') {
				return this.getBlockByNumberOrHash(res.id);
			}
			
			return res;
		}).then((res) => handleResponseErrors(res, 'Block'));
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`getTransaction?transactionId=${transactionHash}`, 'Transaction').then((res) => handleResponseErrors(res, 'Transaction'));
	}
}

module.exports = new LiskClient();