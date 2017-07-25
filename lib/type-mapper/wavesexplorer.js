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

const valueDivisor = 100000000;

function formatAddress(address) {
	return address.startsWith('1W') ? address : `1W${address}`;
}

class WavesExplorerTypeMapper {
	mapAccount(account) {
		return new Account(formatAddress(account.address), account.balance / valueDivisor);
	}
	
	mapBlock(block) {
		return new Block(0, block.signature, block.height, new Date(block.timestamp), block.transactions.length);
	}
	
	mapTransaction(transaction) {
		const amount = transaction.amount / transaction.valueDivisor;
		const amountString = `${amount}${transaction.valueSymbol.length > 0 ? ' ' : ''}${transaction.valueSymbol}`;
		
		return new Transaction(amountString, transaction.blockHash, transaction.id, { address: formatAddress(transaction.recipient), amount: amountString }, { address: formatAddress(transaction.sender), amount: amountString }, new Date(transaction.timestamp));
	}
}

module.exports = new WavesExplorerTypeMapper();