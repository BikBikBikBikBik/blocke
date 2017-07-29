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
const { Account, Block, Transaction } = require('../../lib/type-mapper/models');
const assert = require('../chai-setup');
const equal = require('deep-equal');
const _ = require('underscore');

describe('type-mapper/*', function() {
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.chainradar = require('../../lib/type-mapper/chainradar');
		this.etheradapter = require('../../lib/type-mapper/etheradapter');
		this.gamecredits = require('../../lib/type-mapper/gamecredits');
		this.insight = require('../../lib/type-mapper/insight');
		this.lisk = require('../../lib/type-mapper/lisk');
		this.siatech = require('../../lib/type-mapper/siatech');
		this.sochain = require('../../lib/type-mapper/sochain');
		this.vtconline = require('../../lib/type-mapper/vtconline');
		this.wavesexplorer = require('../../lib/type-mapper/wavesexplorer');
		this.zchain = require('../../lib/type-mapper/zchain');
	});
	
	/*
	 *
	 *  Test Data
	 *
	 */
	const data = {
		chainradar: {
			block: {
				difficulty: 3874653,
				hash: 'a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721',
				height: 1000000,
				timestamp: 3453456546,
				transactions: [ {}, {}, {} ]
			},
			transaction: {
				amountSent: 20000000000000,
				blockHash: '247575ca01657e2f61845dc2b6a64424c7e45952355757b950220b8def3fe5a0',
				hash: 'dbb1ddacd2ae0137752f0e761adcab64d463a0f74d1f506f49cd92a11b336bf1',
				recipients: [
					{ address: '???', amount: 10000000000000 },
					{ address: '???', amount: 5000000000000 },
					{ address: '???', amount: 5000000000000 }
				],
				senders: [
					{ address: '???', amount: 15000000000000 },
					{ address: '???', amount: 3000000000000 },
					{ address: '???', amount: 2000000000000 }
				],
				timestamp: 345634856739
			}
		},
		etheradapter: {
			account: {
				address: '0x3e65303043928403f8a1a2ca4954386e6f39008c',
				balance: 25000000000000000
			},
			block: {
				difficulty: 567567567,
				hash: '0xb8a3f7f5cfc1748f91a684f20fe89031202cbadcd15078c49b85ec2a57f43853',
				height: 4000000,
				timestamp: 1923874932,
				transactions: [ {}, {} ]
			},
			transaction: {
				amountSent: 12,
				blockHash: '0x4bae534f0d843a715bf39451e6e4743bb6c6ccc62413a6d0e449143507eeeecb',
				hash: '0xf40201acac05384548e6053d3cd2a52c43779bd9a22f054374a9d95f6f1e0886',
				recipients: [{ address: '0x3e65303043928403f8a1a2ca4954386e6f39008c', amount: 12 }],
				senders: [{ address: '0x3e653030439284g5798gh39g4h5gh9h5g98h9dfa', amount: 12 }],
				timestamp: 347985634
			}
		},
		gamecredits: {
			account: {
				address: 'GHr1DdrcVw6zEcGyNqiGD164vpohFp5ftn',
				balance: 1337
			},
			block: {
				difficulty: 29348734578,
				hash: '29dcb10822ccb97b408d3ff6fbe001cf632e0878374bf9fe9bf98b71e61a6a20',
				height: 1721200,
				timestamp: 934786539846,
				transactions: [ {}, {}, {}, {} ]
			}
		},
		insight: {
			account: {
				address: 'DsiFdJ2RjLFPM9bTtvn16j3hLvBrcjYK1n3',
				balance: 222,
				unconfirmedBalance: 0.1
			},
			block: {
				difficulty: 3847569384,
				hash: 'b75fa90a7256f7cfdb81b6ad01f048dc6df182db6c8a5e4153bace583109cb8c',
				height: 1818000,
				timestamp: 398457345,
				transactions: [ {} ]
			}
		},
		lisk: {
			account: {
				address: '18278674964748191682L',
				balance: 777,
				unconfirmedBalance: 12.345
			},
			block: {
				difficulty: 0,
				hash: '9104732968165782510',
				height: 3494520,
				timestamp: 1467092942,
				transactions: [ {}, {} ]
			}
		},
		siatech: {
			block: {
				difficulty: 4958764985,
				hash: '0000000000000028ecc091235afb82bd9aca66ebf175137336191ec1d28be993',
				height: 115300,
				timestamp: 3849756348,
				transactions: [ {}, {}, {}, {}, {}, {} ]
			}
		},
		sochain: {
			account: {
				address: '19SokJG7fgk8iTjemJ2obfMj14FM16nqzj',
				balance: 111,
				unconfirmedBalance: 0.01
			},
			block: {
				difficulty: 3094857304,
				hash: '3003cfd2f8ec96c1deb3fc09df99b820189a48a93387882edb83027b507bf7f2',
				height: 1200000,
				timestamp: 2398467293,
				transactions: [ {}, {}, {}, {}, {} ]
			}
		},
		vtconline: {
			account: {
				address: 'VkdFmDNm7geGEWLHiPvEEaaPs2fAD7bmdc',
				balance: 333
			},
			block: {
				difficulty: 345879634985,
				hash: '1b52cf30a05eba4be3bab57303aecc55092ecb44e65b94a7c46fd3a82ef3ec4c',
				height: 750100,
				timestamp: 98347693584,
				transactions: [ {}, {}, {}, {}, {}, {}, {}, {} ]
			}
		},
		wavesexplorer: {
			account: {
				address: '3P51e7GJUTR6hQXq7UTdaX5H4SA1U6gRryn',
				balance: 50000000
			},
			block: {
				difficulty: 0,
				hash: '45ZELbZm5PNXhdixKMniPjU4hGZNyYY53vGVcxAmG76R9ZAwX89p5neMc9MH4ucP5S1E3pePHc99BMUJ8n2xk34',
				height: 590750,
				timestamp: 398457634985,
				transactions: [ {}, {}, {}, {}, {}, {}, {} ]
			}
		},
		zchain: {
			account: {
				address: 't3K4aLYagSSBySdrfAGGeUd5H9z5Qvz88t2',
				balance: 555
			},
			block: {
				difficulty: 3904857340,
				hash: '00000000130f2314d98ddfeea36edbce4aacabe06798c26711b25463923550b8',
				height: 150000,
				timestamp: 798547359843,
				transactions: [ {}, {}, {}, {}, {}, {}, {}, {}, {} ]
			}
		},
	};
	const tests = [
		{
			mapper: 'chainradar',
			inputs: {
				block: {
					blockHeader: {
						difficulty: data.chainradar.block.difficulty,
						hash: data.chainradar.block.hash,
						height: data.chainradar.block.height,
						timestamp: data.chainradar.block.timestamp
					},
					transactions: data.chainradar.block.transactions
				},
				transaction: {
					header: {
						blockHash: data.chainradar.transaction.blockHash,
						hash: data.chainradar.transaction.hash,
						timestamp: data.chainradar.transaction.timestamp,
						totalInputsAmount: data.chainradar.transaction.amountSent
					},
					inputs: _.map(data.chainradar.transaction.senders, (sender) => ({amount: sender.amount})),
					outputs: _.map(data.chainradar.transaction.recipients, (recipient) => ({amount: recipient.amount}))
				}
			},
			expected: {
				transaction: new Transaction(data.chainradar.transaction.amountSent / 1000000000000, data.chainradar.transaction.blockHash, data.chainradar.transaction.hash, _.map(data.chainradar.transaction.recipients, (r) => ({ address: r.address, amount: r.amount / 1000000000000 })), _.map(data.chainradar.transaction.senders, (s) => ({ address: s.address, amount: s.amount / 1000000000000 })), new Date(data.chainradar.transaction.timestamp * 1000))
			}
		},
		{
			mapper: 'etheradapter',
			inputs: {
				account: { address: data.etheradapter.account.address, balance: data.etheradapter.account.balance },
				block: {
					difficulty: data.etheradapter.block.difficulty,
					hash: data.etheradapter.block.hash,
					number: data.etheradapter.block.height,
					time: data.etheradapter.block.timestamp,
					tx_count: data.etheradapter.block.transactions.length
				},
				transaction: {
				}
			},
			expected: {
				account: new Account(data.etheradapter.account.address, data.etheradapter.account.balance / 1000000000000000000),
				block: new Block(data.etheradapter.block.difficulty, data.etheradapter.block.hash, data.etheradapter.block.height, new Date(data.etheradapter.block.timestamp), data.etheradapter.block.transactions.length)
			}
		},
		{
			mapper: 'gamecredits',
			inputs: {
				account: { address: data.gamecredits.account.address, balance: data.gamecredits.account.balance },
				block: {
					difficulty: `${data.gamecredits.block.difficulty}`,
					hash: data.gamecredits.block.hash,
					height: data.gamecredits.block.height,
					time: data.gamecredits.block.timestamp,
					tx: data.gamecredits.block.transactions
				}
			},
			expected: {
			}
		},
		{
			mapper: 'insight',
			inputs: {
				account: { addrStr: data.insight.account.address, balance: data.insight.account.balance, unconfirmedBalance: data.insight.account.unconfirmedBalance },
				block: {
					difficulty: data.insight.block.difficulty,
					hash: data.insight.block.hash,
					height: data.insight.block.height,
					time: data.insight.block.timestamp,
					tx: data.insight.block.transactions
				}
			},
			expected: {
			}
		},
		{
			mapper: 'lisk',
			inputs: {
				account: { address: data.lisk.account.address, balance: `${data.lisk.account.balance + data.lisk.account.unconfirmedBalance}`, unconfirmedBalance: `${data.lisk.account.unconfirmedBalance}` },
				block: {
					block: {
						id: data.lisk.block.hash,
						height: data.lisk.block.height,
						timestamp: data.lisk.block.timestamp - 1464109200,
						numberOfTransactions: data.lisk.block.transactions.length
					}
				}
			},
			expected: {
				account: new Account(data.lisk.account.address, data.lisk.account.balance / 100000000, data.lisk.account.unconfirmedBalance / 100000000),
				block: new Block(0, data.lisk.block.hash, data.lisk.block.height, new Date(data.lisk.block.timestamp * 1000), data.lisk.block.transactions.length)
			}
		},
		{
			mapper: 'siatech',
			inputs: {
				block: {
					difficulty: `${data.siatech.block.difficulty}`,
					blockid: data.siatech.block.hash,
					height: data.siatech.block.height,
					maturitytimestamp: data.siatech.block.timestamp,
					transactions: data.siatech.block.transactions
				}
			},
			expected: {
			}
		},
		{
			mapper: 'sochain',
			inputs: {
				account: { address: data.sochain.account.address, confirmed_balance: data.sochain.account.balance, unconfirmed_balance: data.sochain.account.unconfirmedBalance },
				block: {
					mining_difficulty: `${data.sochain.block.difficulty}`,
					blockhash: data.sochain.block.hash,
					block_no: data.sochain.block.height,
					time: data.sochain.block.timestamp,
					txs: data.sochain.block.transactions
				}
			},
			expected: {
			}
		},
		{
			mapper: 'vtconline',
			inputs: {
				account: { address: data.vtconline.account.address, balance: data.vtconline.account.balance },
				block: {
					difficulty: data.vtconline.block.difficulty,
					hash: data.vtconline.block.hash,
					height: data.vtconline.block.height,
					time: data.vtconline.block.timestamp,
					tx: data.vtconline.block.transactions
				}
			},
			expected: {
			}
		},
		{
			mapper: 'wavesexplorer',
			inputs: {
				account: { address: data.wavesexplorer.account.address, balance: data.wavesexplorer.account.balance },
				block: {
					signature: data.wavesexplorer.block.hash,
					height: data.wavesexplorer.block.height,
					timestamp: data.wavesexplorer.block.timestamp,
					transactions: data.wavesexplorer.block.transactions
				}
			},
			expected: {
				account: new Account(`1W${data.wavesexplorer.account.address}`, data.wavesexplorer.account.balance / 100000000),
				block: new Block(0, data.wavesexplorer.block.hash, data.wavesexplorer.block.height, new Date(data.wavesexplorer.block.timestamp), data.wavesexplorer.block.transactions.length)
			}
		},
		{
			mapper: 'zchain',
			inputs: {
				account: { address: data.zchain.account.address, balance: data.zchain.account.balance },
				block: {
					difficulty: data.zchain.block.difficulty,
					hash: data.zchain.block.hash,
					height: data.zchain.block.height,
					timestamp: data.zchain.block.timestamp,
					transactions: data.zchain.block.transactions.length
				}
			},
			expected: {
			}
		},
	];
	
	/*
	 *
	 *  mapAccount
	 *
	 */
	describe('mapAccount', function() {
		const testPartition = _.partition(tests, (test) => typeof(test.inputs.account) === 'object');
		
		testPartition[0].forEach(function(test) {
			it(`should map an account using ${test.mapper} type mapper`, function() {
				const expectedAccount = test.expected.hasOwnProperty('account') ? test.expected.account : new Account(data[test.mapper].account.address, data[test.mapper].account.balance, data[test.mapper].account.unconfirmedBalance);
				const mappedAccount = this[test.mapper].mapAccount(test.inputs.account);
				
				assert.isTrue(equal(mappedAccount, expectedAccount, {strict: true}), `Actual: ${mappedAccount}\n\nExpected: ${expectedAccount}`);
			});
		});
		
		testPartition[1].forEach(function(test) {
			it(`should not map an account using ${test.mapper} type mapper`, function() {
				assert.throws(() => this[test.mapper].mapAccount(test.inputs.account), Error);
			});
		});
	});
	
	/*
	 *
	 *  mapBlock
	 *
	 */
	describe('mapBlock', function() {
		tests.forEach(function(test) {
			it(`should map a block using ${test.mapper} type mapper`, function() {
				const expectedBlock = test.expected.hasOwnProperty('block') ? test.expected.block : new Block(data[test.mapper].block.difficulty, data[test.mapper].block.hash, data[test.mapper].block.height, new Date(data[test.mapper].block.timestamp * 1000), data[test.mapper].block.transactions.length);
				const mappedBlock = this[test.mapper].mapBlock(test.inputs.block);

				assert.isTrue(equal(mappedBlock, expectedBlock, {strict: true}), `Actual:\n${mappedBlock}\n\nExpected:\n${expectedBlock}`);
			});
		});
	});
	
	/*
	 *
	 *  mapTransaction
	 *
	 */
	describe.skip('mapTransaction', function() {
		tests.forEach(function(test) {
			const infoString = test.hasOwnProperty('extraTestInfo') ? ` (${test.extraTestInfo})` : '';
			
			it(`should map a transaction using ${test.mapper} type mapper${infoString}`, function() {
				const expectedTransaction = test.expected.hasOwnProperty('transaction') ? test.expected.transaction : new Transaction(data[test.mapper].transaction.amountSent, data[test.mapper].transaction.blockHash, data[test.mapper].transaction.hash, data[test.mapper].transaction.recipients, data[test.mapper].transaction.senders, new Date(data[test.mapper].transaction.timestamp * 1000));
				const mappedTransaction = this[test.mapper].mapTransaction(test.inputs.transaction);

				assert.isTrue(equal(mappedTransaction, expectedTransaction, {strict: true}), `Actual:\n${mappedTransaction}\n\nExpected:\n${expectedTransaction}`);
			});
		});
	});
});