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
	constructor(amountSent, blockHash, recipients, senders, time) {
		this._amountSent = amountSent;
		this._blockHash = blockHash;
		this._recipients = Array.isArray(recipients) ? recipients : [recipients];
		this._senders = Array.isArray(senders) ? senders : [senders];
		this._time = time;
	}
	
	toString() {
		return `Amount Sent: ${this._amountSent}\n` +
			   (this._senders.length > 0 ? `Senders:     ${this._senders.join(', ')}\n` : '') +
			   (this._recipients.length > 0 ? `Recipients:  ${this._recipients.join(', ')}\n` : '') +
			   `Block Hash:  ${this._blockHash}\n` +
			   `Time:        ${this._time.toString()}`;
	}
}

exports.Account = Account;
exports.Block = Block;
exports.Transaction = Transaction;