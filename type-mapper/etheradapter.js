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

const weiPerEther = 1000000000000000000;

class EtherAdapterTypeMapper {
	mapAccount(account) {
		return new Account(account.address, account.balance / weiPerEther);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.number, new Date(block.time), block.tx_count);
	}
	
	mapTransaction(transaction) {
		const amount = parseInt(transaction.value, 16) / transaction.valueDivisor;
		const amountString = `${amount}${transaction.valueSymbol.length > 0 ? ' ' : ''}${transaction.valueSymbol}`;
		
		return new Transaction(amountString, transaction.blockHash, transaction.hash, { address: transaction.finalRecipient, amount: amountString }, { address: transaction.from, amount: amountString }, new Date(transaction.time));
	}
}

module.exports = new EtherAdapterTypeMapper();