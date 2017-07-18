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

class EtherchainTypeMapper {
	mapAccount(account) {
		return new Account(account.address, account.balance / weiPerEther);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.number, new Date(block.time), block.tx_count);
	}
	
	mapTransaction(transaction) {
		const amountInEther = transaction.amount / weiPerEther;
		
		return new Transaction(amountInEther, transaction.blockHash, transaction.hash, { address: transaction.recipient, amount: amountInEther }, { address: transaction.sender, amount: amountInEther }, new Date(transaction.time));
	}
}

module.exports = new EtherchainTypeMapper();