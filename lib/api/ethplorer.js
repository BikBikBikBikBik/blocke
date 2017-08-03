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
const resources = require('./resources');
const _ = require('underscore');

class EthplorerClient extends ApiClientBase {
	constructor() {
		super('https://api.ethplorer.io/');
	}
	
	getAccount(accountAddress) {
		const formattedAccount = accountAddress.startsWith('0x') ? accountAddress : '0x' + accountAddress;
		
		return this.executeRequest(`getAddressInfo/${formattedAccount}?apiKey=freekey`, 'Account').then((res) => {
			if (res.hasOwnProperty('error')) {
				return Promise.reject(resources.accountNotFoundMessage);
			}
			
			return res;
		});
	}
	
	getBlockByNumberOrHash() {
		return Promise.reject(resources.operationNotSupportedMessage);
	}
	
	getTransaction(transactionHash) {
		return this.executeRequest(`getTxInfo/${transactionHash}?apiKey=freekey`, 'Transaction').then((res) => {
			if (res.hasOwnProperty('error')) {
				return Promise.reject(resources.transactionNotFoundMessage);
			}
			
			res.valueDivisor = 1;
			res.valueSymbol = '';
			
			if (res.hasOwnProperty('operations')) {
				const transferOperation = _.find(res.operations, (operation) => operation.type === 'transfer');
				
				if (transferOperation !== undefined) {
					res.from  = transferOperation.from;
					res.to = transferOperation.to;
					res.value = transferOperation.intValue;
					res.valueDivisor = Math.pow(10, parseInt(transferOperation.tokenInfo.decimals, 10));
					res.valueSymbol = transferOperation.tokenInfo.symbol;
				}
			}
			
			return res;
		});
	}
}

module.exports = new EthplorerClient();