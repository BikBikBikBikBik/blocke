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
const { Account, Block, Network, Transaction } = require('../../../lib/type-mapper/models');
const assert = require('../../chai-setup');
const equal = require('deep-equal');
const random = require('../../random-generator');
const _ = require('underscore');

describe('lib/type-mapper/models', function() {
	function createType(type, values) {
		const accountCreator = (address, confirmedBalance, unconfirmedBalance) => new Account(address, confirmedBalance, unconfirmedBalance);
		const blockCreator = (difficulty, hash, number, time, transactionCount) => new Block(difficulty, hash, number, time, transactionCount);
		const networkCreator = (difficulty, hashRate, height, lastBlockTime) => new Network(difficulty, hashRate, height, lastBlockTime);
		const transactionCreator = (amountSent, blockHash, hash, recipients, senders, time) => new Transaction(amountSent, blockHash, hash, recipients, senders, time);
		
		const typeCreator = (() => {
			switch (type) {
				case 'Account':
					return accountCreator;

				case 'Block':
					return blockCreator;
				
				case 'Network Info':
					return networkCreator;

				case 'Transaction':
					return transactionCreator;
			}
		})();
		
		return typeCreator.apply(null, values);
	}
	
	/*
	 *
	 *  ToString generators
	 *
	 */
	function accountToString(address, confirmedBalance, unconfirmedBalance) {
		return `Address:             ${address}\n` +
			   (unconfirmedBalance > 0 ? (
			   `Confirmed Balance:   ${confirmedBalance}\n` +
			   `Unconfirmed Balance: ${unconfirmedBalance}\n` +
			   `Total Balance:       ${confirmedBalance + unconfirmedBalance}`)
			   : (`Balance:             ${confirmedBalance}`));
	}
	
	function blockToString(difficulty, hash, number, time, transactionCount) {
		return `Hash:           ${hash}\n` +
			   `Number:         ${number}\n` +
			   `# Transactions: ${transactionCount}\n` +
			   (difficulty > 0 ? `Difficulty:     ${difficulty}\n` : '') +
			   `Time:           ${time.toString()}`;
	}
	
	function getToStringForType(type) {
		switch (type) {
			case 'Account':
				return accountToString;
			
			case 'Block':
				return blockToString;
			
			case 'Network Info':
				return networkToString;
			
			case 'Transaction':
				return transactionToString;
		}
	}
	
	function networkToString(difficulty, hashRate, height, lastBlockTime) {
		return `Difficulty:      ${difficulty}\n` +
			   `Hash Rate:       ${hashRate}\n` +
			   `Height:          ${height}` +
			   (lastBlockTime !== undefined ? `\nLast Block Time: ${lastBlockTime.toString()}` : '');
	}
	
	function transactionToString(amountSent, blockHash, hash, recipients, senders, time) {
		const recipientsStrings = _.map(recipients, (recipient) => `${recipient.address} (${recipient.amount})`);
		const sendersStrings = _.map(senders, (sender) => `${sender.address} (${sender.amount})`);
		
		return `Amount Sent: ${amountSent}\n` +
			   (sendersStrings.length > 0 ? `Senders:     ${sendersStrings.join('\n             ')}\n` : '') +
			   (recipientsStrings.length > 0 ? `Recipients:  ${recipientsStrings.join('\n             ')}\n` : '') +
			   `Block Hash:  ${blockHash}\n` +
			   `Hash:        ${hash}\n` +
			   (time !== undefined ? `Time:        ${time.toString()}` : '');
	}
	
	/*
	 *
	 *  Field validators
	 *
	 */
	function getValidatorForType(type) {
		switch (type) {
			case 'Account':
				return validateAccount;
			
			case 'Block':
				return validateBlock;
			
			case 'Network Info':
				return validateNetwork;
			
			case 'Transaction':
				return validateTransaction;
		}
	}
	
	function validateAccount(instance, address, confirmedBalance, unconfirmedBalance) {
		assert.equal(instance._address, address);
		assert.equal(instance._confirmedBalance, confirmedBalance);
		assert.equal(instance._unconfirmedBalance, typeof(unconfirmedBalance) === 'number' ? unconfirmedBalance : 0);
	}
	
	function validateBlock(instance, difficulty, hash, number, time, transactionCount) {
		assert.equal(instance._difficulty, difficulty);
		assert.equal(instance._hash, hash);
		assert.equal(instance._number, number);
		assert.equal(instance._time, time);
		assert.equal(instance._transactionCount, transactionCount);
	}
	
	function validateNetwork(instance, difficulty, hashRate, height, lastBlockTime) {
		assert.equal(instance._difficulty, difficulty);
		assert.equal(instance._hashRate, hashRate);
		assert.equal(instance._height, height);
		assert.equal(instance._lastBlockTime, lastBlockTime);
	}
	
	function validateTransaction(instance, amountSent, blockHash, hash, recipients, senders, time) {
		assert.equal(instance._amountSent, amountSent);
		assert.equal(instance._blockHash, blockHash);
		assert.equal(instance._hash, hash);
		assert.deepEqual(instance._recipients, Array.isArray(recipients) ? recipients : [recipients]);
		assert.deepEqual(instance._senders, Array.isArray(senders) ? senders : [senders]);
		assert.equal(instance._time, time);
	}
	
	/*
	 *
	 *  Test Data
	 *
	 */
	const tests = [
		{
			type: 'Account',
			values: [ random.generateRandomHashString(32), random.generateRandomIntInclusive(1, 1000), random.generateRandomIntInclusive(1, 1000) ],
			extraTestInfo: 'Unconfirmed balance value supplied'
		},
		{
			type: 'Account',
			values: [ random.generateRandomHashString(32), random.generateRandomIntInclusive(1, 1000) ],
			extraTestInfo: 'Unconfirmed balance value not supplied'
		},
		{
			type: 'Block',
			values: [
				random.generateRandomIntInclusive(10000, 10000000000),
				random.generateRandomHashString(32),
				random.generateRandomIntInclusive(1, 1000000),
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000),
				random.generateRandomIntInclusive(1, 100)
			],
			extraTestInfo: 'Difficulty is non-zero'
		},
		{
			type: 'Block',
			values: [
				0,
				random.generateRandomHashString(32),
				random.generateRandomIntInclusive(1, 1000000),
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000),
				random.generateRandomIntInclusive(1, 100)
			],
			extraTestInfo: 'Difficulty is zero'
		},
		{
			type: 'Network Info',
			values: [
				random.generateRandomIntInclusive(100000, 10000000),
				random.generateRandomIntInclusive(100000, 10000000),
				random.generateRandomIntInclusive(100000, 10000000),
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000)
			],
			extraTestInfo: 'All fields populated'
		},
		{
			type: 'Network Info',
			values: [
				random.generateRandomIntInclusive(100000, 10000000),
				random.generateRandomIntInclusive(100000, 10000000),
				random.generateRandomIntInclusive(100000, 10000000)
			],
			extraTestInfo: 'Time is undefined'
		},
		{
			type: 'Transaction',
			values: [
				random.generateRandomIntInclusive(1, 10000),
				random.generateRandomHashString(32),
				random.generateRandomHashString(32),
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				],
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				],
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000),
			],
			extraTestInfo: 'All fields populated'
		},
		{
			type: 'Transaction',
			values: [
				random.generateRandomIntInclusive(1, 10000),
				random.generateRandomHashString(32),
				random.generateRandomHashString(32),
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				],
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				]
			],
			extraTestInfo: 'Time is undefined'
		},
		{
			type: 'Transaction',
			values: [
				random.generateRandomIntInclusive(1, 10000),
				random.generateRandomHashString(32),
				random.generateRandomHashString(32),
				[],
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				],
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000),
			],
			extraTestInfo: 'Zero recipients'
		},
		{
			type: 'Transaction',
			values: [
				random.generateRandomIntInclusive(1, 10000),
				random.generateRandomHashString(32),
				random.generateRandomHashString(32),
				[
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) },
					{ address: random.generateRandomHashString(32), amount: random.generateRandomIntInclusive(1, 1000) }
				],
				[],
				new Date(random.generateRandomIntInclusive(100000, 10000000) * 1000),
			],
			extraTestInfo: 'Zero senders'
		}
	];
	
	/*
	 *
	 *  All models
	 *
	 */
	const testGroups = _.groupBy(tests, 'type');
	_.each(testGroups, (testGroup, type) => {
		describe(type, function() {
			testGroup.forEach((test) => {
				it(`should return formatted output from toString (${test.extraTestInfo})`, function() {
					const instance = createType(test.type, test.values);
					const toString = getToStringForType(test.type);
					
					assert.equal(instance.toString(), toString.apply(null, test.values));
				});
			});
			
			testGroup.forEach((test) => {
				it(`should save all constructor inputs internally (${test.extraTestInfo})`, function() {
					const instance = createType(test.type, test.values);
					const validator = getValidatorForType(test.type);
					
					validator.apply(null, [instance].concat(test.values));
				});
			});
		});
	});
});