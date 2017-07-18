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

class ZChainTypeMapper {
	mapAccount(account) {
		return new Account(account.address, account.balance);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.height, new Date(block.timestamp * 1000), block.transactions);
	}
	
	mapTransaction(transaction) {
		return new Transaction(transaction.value, transaction.blockHash, transaction.hash, _.map(transaction.vout, (output) => ({ address: output.scriptPubKey.addresses[0], amount: output.value })),
			_.map(_.filter(transaction.vin, (input) => input.hasOwnProperty('retrievedVout')), (input) => ({ address: input.retrievedVout.scriptPubKey.addresses[0], amount: input.retrievedVout.value })), new Date(transaction.timestamp * 1000));
	}
}

module.exports = new ZChainTypeMapper();