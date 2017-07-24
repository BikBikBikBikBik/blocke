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
const { Account, Block, Transaction } = require('./models');
const _ = require('underscore');

class InsightTypeMapper {
	mapAccount(account) {
		return new Account(account.addrStr, account.balance, account.unconfirmedBalance);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.height, new Date(block.time * 1000), block.tx.length);
	}
	
	mapTransaction(transaction) {
		const normalInputs = _.filter(transaction.vin, (input) => input.hasOwnProperty('addr') && input.hasOwnProperty('value'));	//Exclude coinbase inputs
		const normalOutputs = _.filter(transaction.vout, (output) => output.scriptPubKey.hasOwnProperty('addresses'));
		
		return new Transaction(_.reduce(normalInputs, (total, input) => total + input.value, 0), transaction.blockhash, transaction.txid,
			_.map(normalOutputs, (output) => ({ address: output.scriptPubKey.addresses[0], amount: parseFloat(output.value) })),
			_.map(normalInputs, (input) => ({ address: input.addr, amount: input.value })), transaction.time ? new Date(transaction.time * 1000) : undefined);
	}
}

module.exports = new InsightTypeMapper();