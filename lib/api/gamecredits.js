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
const _ = require('underscore');

class GameCreditsClient extends ApiClientBase {
	constructor() {
		super('http://blockexplorer.gamecredits.com/api/');
	}
	
	getAccount(accountAddress) {
		return this.executeRequest(`addresses/${accountAddress}/balance`, 'Account').then((res) => ({ address: accountAddress, balance: res }));
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`blocks?height=${blockId}`, 'Block').catch(() => this.executeRequest(`blocks/${blockId}`, 'Block'));
	}
	
	getTransaction(transactionHash, fetchVinAddresses = true) {
		return this.executeRequest(`transactions/${transactionHash}`, 'Transaction').then((res) => {
			if (fetchVinAddresses === true) {
				return this.updateTransactionInputAddresses(res);
			}
			
			return res;
		}).then((res) => {
			if (res.vin.length === 1 && res.vin[0].prev_txid === null) {
				res.vin[0].address = 'coinbase';
				res.vin[0].value = res.total;
			}
			
			return res;
		});
	}
	
	updateTransactionInputAddresses(transaction) {
		const vinTransactions = _.filter(transaction.vin, (input) => typeof(input.prev_txid) === 'string');
		const vinTransactionPromises = _.map(vinTransactions, (input) => this.getTransaction(input.prev_txid, false));
		
		return Promise.all(vinTransactionPromises).then((res) => {
			_.each(res, (tx) => {
				const sourceVin = _.find(vinTransactions, (vin) => vin.prev_txid === tx.txid);
				
				if (sourceVin.vout_index < tx.vout.length) {
					sourceVin.address = tx.vout[sourceVin.vout_index].addresses[0];
					sourceVin.value = tx.vout[sourceVin.vout_index].value;
				}
			});
			
			return transaction;
		});
	}
}

module.exports = new GameCreditsClient();