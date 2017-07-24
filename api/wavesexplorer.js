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

class WavesExplorerClient extends ApiClientBase {
	constructor() {
		super('https://nodes.wavesnodes.com/');
	}
	
	getAccount(accountAddress) {
		const formattedAccountAddress = accountAddress.startsWith('1W') ? accountAddress.substr(2) : accountAddress;
		
		return this.executeRequest(`addresses/balance/${formattedAccountAddress}`, 'Account');
	}
	
	getBlockByNumberOrHash(blockId) {
		const self = this;
		
		return this.executeRequest(`blocks/signature/${blockId}`, 'Block').catch(function(err) {
			return self.executeRequest(`blocks/at/${blockId}`, 'Block');
		});
	}
	
	getTransaction(transactionHash) {
		let transaction = undefined;
		
		const self = this;
		
		return this.executeRequest(`transactions/info/${transactionHash}`, 'Transaction').then(function(res) {
			//Only handle asset transfer transactions
			if (res.type === 4) {
				res.valueDivisor = 100000000;
				res.valueSymbol = '';

				if (typeof(res.assetId) === 'string') {
					return self.updateTransactionFromAssetInfo(res);
				}

				return res;
			}
			
			return Promise.reject(`Transaction type ${res.type} not supported.`);
		}).then(function(res) {
			transaction = res;
			
			return self.executeRequest(`blocks/at/${transaction.height}`, 'Transaction');
		}).then(function(res) {
			transaction.blockHash = res.signature;
			
			return transaction;
		});
	}
	
	updateTransactionFromAssetInfo(transaction) {
		return this.executeRequest(`transactions/info/${transaction.assetId}`, 'Transaction').then(function(res) {
			transaction.valueDivisor = Math.pow(10, res.decimals);
			transaction.valueSymbol = res.name;
			
			return transaction;
		});
	}
}

module.exports = new WavesExplorerClient();