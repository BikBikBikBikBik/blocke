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

class GameCreditsTypeMapper {
	mapAccount(account) {
		return new Account(account.address, account.balance);
	}
	
	mapBlock(block) {
		return new Block(parseFloat(block.difficulty), block.hash, block.height, new Date(block.time * 1000), block.tx.length);
	}
	
	mapTransaction(transaction) {
		if (transaction.vin.length === 1 && typeof(transaction.vin[0].coinbase) === 'string') {
			transaction.vin[0].address = 'Newly generated coins';
			transaction.vin[0].value = transaction.total;
		}
		
		return new Transaction(_.reduce(transaction.vin, (total, input) => total + input.value, 0), transaction.blockhash, transaction.txid,
			_.map(transaction.vout, (output) => ({ address: output.addresses[0], amount: output.value })),
			_.map(transaction.vin, (input) => ({ address: input.address, amount: input.value })), new Date(transaction.blocktime * 1000));
	}
}

module.exports = new GameCreditsTypeMapper();