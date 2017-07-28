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
	const tests = [
		{
			mapper: 'chainradar',
			inputs: {
			},
			expected: {
			}
		},
		{
			mapper: 'etheradapter',
			inputs: {
				account: { address: '0x3e65303043928403f8a1a2ca4954386e6f39008c', balance: 25000000000000000 },
			},
			expected: {
				account: new Account('0x3e65303043928403f8a1a2ca4954386e6f39008c', 0.025),
			}
		},
		{
			mapper: 'gamecredits',
			inputs: {
				account: { address: 'GHr1DdrcVw6zEcGyNqiGD164vpohFp5ftn', balance: 1337 },
			},
			expected: {
				account: new Account('GHr1DdrcVw6zEcGyNqiGD164vpohFp5ftn', 1337),
			}
		},
		{
			mapper: 'insight',
			inputs: {
				account: { addrStr: 'DsiFdJ2RjLFPM9bTtvn16j3hLvBrcjYK1n3', balance: 222, unconfirmedBalance: 0.1 },
			},
			expected: {
				account: new Account('DsiFdJ2RjLFPM9bTtvn16j3hLvBrcjYK1n3', 222, 0.1),
			}
		},
		{
			mapper: 'siatech',
			inputs: {
			},
			expected: {
			}
		},
		{
			mapper: 'sochain',
			inputs: {
				account: { address: '19SokJG7fgk8iTjemJ2obfMj14FM16nqzj', confirmed_balance: 111, unconfirmed_balance: 0.01 },
			},
			expected: {
				account: new Account('19SokJG7fgk8iTjemJ2obfMj14FM16nqzj', 111, 0.01),
			}
		},
		{
			mapper: 'vtconline',
			inputs: {
				account: { address: 'VkdFmDNm7geGEWLHiPvEEaaPs2fAD7bmdc', balance: 333 },
			},
			expected: {
				account: new Account('VkdFmDNm7geGEWLHiPvEEaaPs2fAD7bmdc', 333),
			}
		},
		{
			mapper: 'wavesexplorer',
			inputs: {
				account: { address: '3P51e7GJUTR6hQXq7UTdaX5H4SA1U6gRryn', balance: 50000000 },
			},
			expected: {
				account: new Account('3P51e7GJUTR6hQXq7UTdaX5H4SA1U6gRryn', 0.5),
			}
		},
		{
			mapper: 'zchain',
			inputs: {
				account: { address: 't3K4aLYagSSBySdrfAGGeUd5H9z5Qvz88t2', balance: 555 },
			},
			expected: {
				account: new Account('t3K4aLYagSSBySdrfAGGeUd5H9z5Qvz88t2', 555),
			}
		},
	];
	
	/*
	 *
	 *  mapAccount
	 *
	 */
	describe('mapAccount', function() {
		//[0] = Type mappers that support mapAccount()
		//[1] = Type mappers that do not support mapAccount()
		const testPartition = _.partition(tests, (test) => typeof(test.inputs.account) === 'object');
		
		testPartition[0].forEach(function(test) {
			it(`should map an account using ${test.mapper} type mapper`, function() {
				equal(this[test.mapper].mapAccount(test.inputs.account), test.expected.account, {strict: true});
			});
		});
		
		testPartition[1].forEach(function(test) {
			it(`should not map an account using ${test.mapper} type mapper`, function() {
				assert.throws(() => this[test.mapper].mapAccount(test.inputs.account), Error);
			});
		});
	});
});