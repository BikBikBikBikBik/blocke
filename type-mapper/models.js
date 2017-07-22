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
const _ = require('underscore');

class Account {
	constructor(address, confirmedBalance, unconfirmedBalance) {
		this._address = address;
		this._confirmedBalance = confirmedBalance;
		this._unconfirmedBalance = typeof(unconfirmedBalance) === 'number' ? unconfirmedBalance : 0;
	}
	
	toString() {
		return `Address:             ${this._address}\n` +
			   `Confirmed Balance:   ${this._confirmedBalance}\n` +
			   `Unconfirmed Balance: ${this._unconfirmedBalance}\n` +
			   `Total Balance:       ${this._confirmedBalance + this._unconfirmedBalance}`;
	}
}

class Block {
	constructor(difficulty, hash, number, time, transactionCount) {
		this._difficulty = difficulty;
		this._hash = hash;
		this._number = number;
		this._time = time;
		this._transactionCount = transactionCount;
	}
	
	toString() {
		return `Hash:           ${this._hash}\n` +
			   `Number:         ${this._number}\n` +
			   `# Transactions: ${this._transactionCount}\n` +
			   `Difficulty:     ${this._difficulty}\n` +
			   `Time:           ${this._time.toString()}`;
	}
}

class Transaction {
	constructor(amountSent, blockHash, hash, recipients, senders, time) {
		this._amountSent = amountSent;
		this._blockHash = blockHash;
		this._hash = hash;
		this._recipients = Array.isArray(recipients) ? recipients : [recipients];
		this._senders = Array.isArray(senders) ? senders : [senders];
		this._time = time;
	}
	
	toString() {
		const recipients = _.map(this._recipients, (recipient) => `${recipient.address} (${recipient.amount})`);
		const senders = _.map(this._senders, (sender) => `${sender.address} (${sender.amount})`);
		
		return `Amount Sent: ${this._amountSent}\n` +
			   (senders.length > 0 ? `Senders:     ${senders.join(', ')}\n` : '') +
			   (recipients.length > 0 ? `Recipients:  ${recipients.join(', ')}\n` : '') +
			   `Block Hash:  ${this._blockHash}\n` +
			   `Hash:        ${this._hash}\n` +
			   (this._time !== undefined ? `Time:        ${this._time.toString()}` : '');
	}
}

exports.Account = Account;
exports.Block = Block;
exports.Transaction = Transaction;