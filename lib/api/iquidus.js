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

const _iquidusApiBaseAddressMap = {
	sigt: 'http://explorer.signatum.download/',
	vtc: 'https://explorer.vtconline.org/'
};

class IquidusClient extends ApiClientBase {
	constructor(network) {
		const formattedNetwork = network.trim().toLowerCase();
		if (!_iquidusApiBaseAddressMap.hasOwnProperty(formattedNetwork)) {
			throw new Error(resources.generateUnsupportedNetworkMessage(network));
		}
		
		super(_iquidusApiBaseAddressMap[formattedNetwork]);
	}
	
	getAccount(accountAddress) {
		return this.executeRequest(`ext/getaddress/${accountAddress}`, 'Account').then((res) => {
			if (typeof(res) === 'object' && !res.hasOwnProperty('error')) {
				return res;
			}
			
			return Promise.reject(resources.accountNotFoundMessage);
		});
	}
	
	getBlockByNumber(blockHeight) {
		return this.executeRequest(`api/getblockhash?index=${blockHeight}`, 'Block').then((res) => {
			if (!res.startsWith('There was an error.')) {
				return this.getBlockByNumberOrHash(res);
			}
			
			return Promise.reject(resources.blockNotFoundMessage);
		});
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`api/getblock?hash=${blockId}`, 'Block').then((res) => {
			if (typeof(res) === 'string') {
				return this.getBlockByNumber(blockId);
			}
			
			return res;
		});
	}
	
	getTransaction(transactionHash, fetchVinAddresses = true) {
		return this.executeRequest(`api/getrawtransaction?txid=${transactionHash}&decrypt=1`, 'Transaction').then((res) => {
			if (typeof(res) !== 'string') {
				if (fetchVinAddresses === true) {
					return this.updateTransactionInputAddresses(res);
				}
				
				return res;
			}
			
			return Promise.reject(resources.transactionNotFoundMessage);
		});
	}
	
	updateTransactionInputAddresses(transaction) {
		const vinTransactions = _.filter(transaction.vin, (input) => input.hasOwnProperty('txid'));
		const vinTransactionPromises = _.map(vinTransactions, (input) => this.getTransaction(input.txid, false));

		return Promise.all(vinTransactionPromises).then((res) => {
			_.each(res, (tx) => {
				const sourceVin = _.find(vinTransactions, (vin) => vin.txid === tx.txid);
				const prevTxVout = _.find(tx.vout, (vout) => vout.n === sourceVin.vout);

				sourceVin.address = prevTxVout.scriptPubKey.addresses[0];
				sourceVin.value = prevTxVout.value;
			});
			
			return transaction;
		});
	}
}

module.exports = IquidusClient;