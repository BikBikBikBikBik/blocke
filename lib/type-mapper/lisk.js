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

const timestampOffset = 1464109200;	//Lisk uses its genesis block timestamp as the epoch
const valueDivisor = 100000000;

class LiskTypeMapper {
	mapAccount(account) {
		const totalBalance = parseFloat(account.balance);
		const unconfirmedBalance = parseFloat(account.unconfirmedBalance);
		const confirmedBalance = totalBalance - unconfirmedBalance;
		
		return new Account(account.address, confirmedBalance / valueDivisor, unconfirmedBalance / valueDivisor);
	}
	
	mapBlock(block) {
		return new Block(0, block.block.id, block.block.height, new Date((timestampOffset + block.block.timestamp) * 1000), block.block.numberOfTransactions);
	}
	
	mapTransaction(transaction) {
		const amountSent = transaction.transaction.amount / valueDivisor;
		const recipient = { address: transaction.transaction.recipientId, amount: amountSent };
		switch (transaction.transaction.type) {
			case 1:
				recipient.address = 'Second signature creation';
			break;
			
			case 2:
				recipient.address = 'Delegate registration';
			break;
			
			case 3:
				recipient.address = 'Delegate vote';
			break;
			
			case 4:
				recipient.address = 'Multisignature registration';
			break;
		}
		
		return new Transaction(amountSent, transaction.transaction.blockId, transaction.transaction.id, recipient, { address: transaction.transaction.senderId, amount: amountSent}, new Date((timestampOffset + transaction.transaction.timestamp) * 1000));
	}
}

module.exports = new LiskTypeMapper();