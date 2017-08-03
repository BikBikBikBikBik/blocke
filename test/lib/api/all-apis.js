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
const apiResources = require('../../../lib/api/resources');
const assert = require('../../chai-setup');
const equal = require('deep-equal');
const nock = require('nock');
const random = require('../../random-generator');
const _ = require('underscore');

//Had issues with timing of before() hook, this is part of a workaround
let addAllGenericErrorTestsWasCalled = false;

describe('lib/api/*', function() {
	function addAllGenericErrorTests() {
		function addGenericErrorTests(test, testFieldName, notFoundMessage, objectName) {
			if (test.hasOwnProperty(testFieldName)) {
				const mockErrorTestResponseTemplate = _.find(test[testFieldName], (data) => data.useAsErrorTestResponseTemplate === true);
				const testData = mockErrorTestResponseTemplate !== undefined ? mockErrorTestResponseTemplate : _.sortBy(test[testFieldName], (data) => -data.mockResponseData.length)[0];
				const urlFormatters = _.pluck(testData.mockResponseData, 'urlFormatter');
				const uniqueUrlFormatters = _.uniq(urlFormatters);
				
				test[testFieldName] = test[testFieldName].concat(generateGenericErrorTests(uniqueUrlFormatters, testData.mockResponseData[0].values, notFoundMessage, apiResources.generateGenericObjectErrorMessage(objectName)));
			}
		}
		
		tests.forEach((test) => {
			addGenericErrorTests(test, 'getAccountTests', apiResources.accountNotFoundMessage, 'Account');
			addGenericErrorTests(test, 'getBlockByNumberOrHashTests', apiResources.blockNotFoundMessage, 'Block');
			addGenericErrorTests(test, 'getTransactionTests', apiResources.transactionNotFoundMessage, 'Transaction');
		});
	}
	
	function generateGenericErrorTests(urlFormatters, urlFormatterValues, notFoundMessage, genericErrorMessage) {
		function generateMockResponseData(statusCode) {
			return _.map(urlFormatters, (urlFormatter) => ({
				response: { data: {success: false}, statusCode: statusCode },
				urlFormatter: urlFormatter,
				values: urlFormatterValues
			}));
		}
		
		const urlFormattersArray = Array.isArray(urlFormatters) ? urlFormatters : [urlFormatters];
		
		return [
			{
				methodInput: random.generateRandomHashString(32),
				mockResponseData: generateMockResponseData(400),
				expectedError: notFoundMessage,
				extraTestInfo: 'HTTP 400 response'
			},
			{
				methodInput: random.generateRandomHashString(32),
				mockResponseData: generateMockResponseData(404),
				expectedError: notFoundMessage,
				extraTestInfo: 'HTTP 404 response'
			},
			{
				methodInput: random.generateRandomHashString(32),
				mockResponseData: generateMockResponseData(429),
				expectedError: apiResources.tooManyRequestsMessage,
				extraTestInfo: 'HTTP 429 response'
			},
			{
				methodInput: random.generateRandomHashString(32),
				mockResponseData: generateMockResponseData(500),
				expectedError: genericErrorMessage,
				extraTestInfo: 'HTTP 500 response'
			}
		];
	}
	
	function prepareMockHttpResponses(test, testData, apiData, networkForApiUrl) {
		testData.mockResponseData.forEach((mockResponse) => {
			const apiBaseAddress = apiData.hasOwnProperty('apiBaseAddress') ? apiData.apiBaseAddress : test.apiBaseAddress;
			let urlSuffix = test.urlFormatters[mockResponse.urlFormatter];

			_.each(mockResponse.values, (replacementValue, index) => {
				const actualValue = (() => {
					switch (replacementValue) {
						case '[input]':
							return testData.methodInput;

						case '[network]':
							return networkForApiUrl;

						default:
							return replacementValue;
					}
				})();

				urlSuffix = urlSuffix.replace(`[${index}]`, actualValue);
			});

			nock(apiBaseAddress).get(urlSuffix).reply(mockResponse.response.statusCode, mockResponse.response.data);
		});
	}
	
	function runTestForApiClientMethod(test, methodName, objectName) {
		if (addAllGenericErrorTestsWasCalled === false) {
			addAllGenericErrorTests();
			
			addAllGenericErrorTestsWasCalled = true;
		}
		
		describe(test.api, function() {
			const apiArray = typeof(test.networks) === 'object' ? _.map(test.networks, (data, network) => {
				const apiData = { api: (self) => new self[test.api](network), network: network };
				if (data.hasOwnProperty('apiBaseAddress')) {
					apiData.apiBaseAddress = data.apiBaseAddress;
				}
				if (data.hasOwnProperty('networkAlias')) {
					apiData.networkAlias = data.networkAlias;
				}

				return apiData;
			}) : [{api: (self) => self[test.api]}];

			apiArray.forEach((apiData) => {
				const isMultiNetworkApi = apiData.hasOwnProperty('network');
				const networkForApiUrl = apiData.hasOwnProperty('networkAlias') ? apiData.networkAlias : apiData.network;

				function runTests() {
					if (test.hasOwnProperty(`${methodName}Tests`)) {
						const successAndErrorTests = _.partition(test[`${methodName}Tests`], (testData) => testData.hasOwnProperty('expectedResult'));

						successAndErrorTests[0].forEach((testData) => {
							it(`should return a ${objectName} (${testData.extraTestInfo})`, function(done) {
								const expectedResult = testData.expectedResult.hasOwnProperty(apiData.network) ? testData.expectedResult[apiData.network] : testData.expectedResult;

								prepareMockHttpResponses(test, testData, apiData, networkForApiUrl);

								apiData.api(this)[methodName](testData.methodInput).should.eventually.deep.equal(expectedResult).and.notify(done);
							});
						});

						successAndErrorTests[1].forEach((testData) => {
							it(`should not return a ${objectName} (${testData.extraTestInfo})`, function(done) {
								const expectedError = testData.expectedError.hasOwnProperty(apiData.network) ? testData.expectedError[apiData.network] : testData.expectedError;

								prepareMockHttpResponses(test, testData, apiData, networkForApiUrl);

								apiData.api(this)[methodName](testData.methodInput).should.eventually.be.rejectedWith(expectedError).and.notify(done);
							});
						});
					} else {
						it(`should not return a ${objectName} (Operation not supported)`, function(done) {
							apiData.api(this)[methodName]().should.eventually.be.rejectedWith(apiResources.operationNotSupportedMessage).and.notify(done);
						});
					}
				}
				
				if (isMultiNetworkApi === true) {
					describe(apiData.network, runTests);
				} else {
					runTests();
				}
			});
		});
	}
	
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.chainradar = require('../../../lib/api/chainradar');
		this.etherchain = require('../../../lib/api/etherchain');
		this.ethplorer = require('../../../lib/api/ethplorer');
		this.gamecredits = require('../../../lib/api/gamecredits');
		this.insight = require('../../../lib/api/insight');
		this.lisk = require('../../../lib/api/lisk');
		this.siatech = require('../../../lib/api/siatech');
		this.sochain = require('../../../lib/api/sochain');
		this.vtconline = require('../../../lib/api/vtconline');
		this.wavesexplorer = require('../../../lib/api/wavesexplorer');
		this.zchain = require('../../../lib/api/zchain');
	});
	
	/*
	 *
	 *  Test Data
	 *
	 */
	const tests = [
		{
			api: 'chainradar',
			apiBaseAddress: 'http://chainradar.com',
			networks: {
				aeon: {},
				bcn: {},
				xdn: { networkAlias: 'duck' },
				xmr: { networkAlias: 'mro' }
			},
			urlFormatters: {
				block: '/api/v1/[0]/blocks/[1]/full',
				transaction: '/api/v1/[0]/transactions/[1]/full'
			},
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '235tgwfrvsc'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, '235tgwfrvsc')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '235tgwfrvsc')},
					extraTestInfo: 'Valid block id'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: {code: 'ApiNotAvailable'}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.apiNotAvailable,
					extraTestInfo: 'ApiNotAvailable response'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: {code: 'RequestLimitExceeded'}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'RequestLimitExceeded response'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, 'aeg4rbtfgr2'),
					mockResponseData: [
						{
							response: { data: {txid: random.generateRandomHashString(32, 'aeg4rbtfgr2')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {
						aeon: { txid: random.generateRandomHashString(32, 'aeg4rbtfgr2'), valueDivisor: 1000000000000 },
						bcn: { txid: random.generateRandomHashString(32, 'aeg4rbtfgr2'), valueDivisor: 100000000 },
						xdn: { txid: random.generateRandomHashString(32, 'aeg4rbtfgr2'), valueDivisor: 100000000 },
						xmr: { txid: random.generateRandomHashString(32, 'aeg4rbtfgr2'), valueDivisor: 1000000000000 },
					},
					extraTestInfo: 'Valid transaction hash'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: {code: 'ApiNotAvailable'}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.apiNotAvailable,
					extraTestInfo: 'ApiNotAvailable response'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: {code: 'RequestLimitExceeded'}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'RequestLimitExceeded response'
				}
			]
		},
		{
			api: 'etherchain',
			apiBaseAddress: 'https://etherchain.org',
			urlFormatters: {
				block: '/api/block/[0]'
			},
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '54teryghdf'),
					mockResponseData: [
						{
							response: { data: {data: [{hash: random.generateRandomHashString(32, '54teryghdf')}]}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '54teryghdf')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: `${random.generateRandomIntInclusive(1, 5000000, 'asdgfs435')}`,
					mockResponseData: [
						{
							response: { data: {data: [{ hash: random.generateRandomHashString(32, '23tgfda'), number: random.generateRandomIntInclusive(1, 5000000, 'asdgfs435') }]}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: { hash: random.generateRandomHashString(32, '23tgfda'), number: random.generateRandomIntInclusive(1, 5000000, 'asdgfs435') },
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomHashString(32, '2354ythdjg'),
					mockResponseData: [
						{
							response: { data: {data: [{ hash: random.generateRandomHashString(32, 'asgfdb4'), number: random.generateRandomIntInclusive(1, 5000000, '254thgfsb') }]}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Default block #0 response'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: { data: [], success: false }, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			]
		},
		{
			api: 'ethplorer',
			apiBaseAddress: 'https://api.ethplorer.io',
			urlFormatters: {
				account: '/getAddressInfo/[0]?apiKey=freekey',
				accountPlusPrefix: '/getAddressInfo/0x[0]?apiKey=freekey',
				transaction: '/getTxInfo/[0]?apiKey=freekey'
			},
			getAccountTests: [
				{
					methodInput: `0x${random.generateRandomHashString(32, '245ythdgf')}`,
					mockResponseData: [
						{
							response: { data: {address: `0x${random.generateRandomHashString(32, '245ythdgf')}`}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: `0x${random.generateRandomHashString(32, '245ythdgf')}`},
					extraTestInfo: `Valid account address with '0x' prefix`
				},
				{
					methodInput: random.generateRandomHashString(32, '43565ythdd'),
					mockResponseData: [
						{
							response: { data: {address: `0x${random.generateRandomHashString(32, '43565ythdd')}`}, statusCode: 200 },
							urlFormatter: 'accountPlusPrefix',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: `0x${random.generateRandomHashString(32, '43565ythdd')}`},
					extraTestInfo: `Valid account address without '0x' prefix`,
					useAsErrorTestResponseTemplate: true
				},
				{
					methodInput: `0x${random.generateRandomHashString(32, '45trgfh')}`,
					mockResponseData: [
						{
							response: { data: {error: 'Invalid account'}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.accountNotFoundMessage,
					extraTestInfo: `Generic error response`
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '234htgnbx'),
					mockResponseData: [
						{
							response: { data: {txid: random.generateRandomHashString(32, '234htgnbx')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: { txid: random.generateRandomHashString(32, '234htgnbx'), valueDivisor: 1, valueSymbol: '' },
					extraTestInfo: 'ETH transfer'
				},
				{
					methodInput: random.generateRandomHashString(32, '27yuerofdsa'),
					mockResponseData: [
						{
							response: {
								data: { operations: [{
									from: random.generateRandomHashString(32, 'rtgsiuodl'),
									intValue: random.generateRandomIntInclusive(1, 1000, '4578orthyg'),
									to: random.generateRandomHashString(32, '243trg'),
									tokenInfo: {
										decimals: `${random.generateRandomIntInclusive(2, 8, '324trh')}`,
										symbol: random.generateRandomHashString(3, 'eutiohsldjf')
									},
									type: 'transfer'
								}]},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {
						from: random.generateRandomHashString(32, 'rtgsiuodl'),
						operations: [{
							from: random.generateRandomHashString(32, 'rtgsiuodl'),
							intValue: random.generateRandomIntInclusive(1, 1000, '4578orthyg'),
							to: random.generateRandomHashString(32, '243trg'),
							tokenInfo: {
								decimals: `${random.generateRandomIntInclusive(2, 8, '324trh')}`,
								symbol: random.generateRandomHashString(3, 'eutiohsldjf')
							},
							type: 'transfer'
						}],
						to: random.generateRandomHashString(32, '243trg'),
						value: random.generateRandomIntInclusive(1, 1000, '4578orthyg'),
						valueDivisor: Math.pow(10, random.generateRandomIntInclusive(2, 8, '324trh')),
						valueSymbol: random.generateRandomHashString(3, 'eutiohsldjf')
					},
					extraTestInfo: 'Token transfer'
				},
				{
					methodInput: random.generateRandomHashString(32, '43tytrhgf'),
					mockResponseData: [
						{
							response: {
								data: { operations: [{
									from: random.generateRandomHashString(32, '35ythdg'),
									to: random.generateRandomHashString(32, '243regsf'),
									type: random.generateRandomHashString(32, '378teruhgilf')
								}]},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {
						operations: [{
							from: random.generateRandomHashString(32, '35ythdg'),
							to: random.generateRandomHashString(32, '243regsf'),
							type: random.generateRandomHashString(32, '378teruhgilf')
						}],
						valueDivisor: 1,
						valueSymbol: ''
					},
					extraTestInfo: 'Non-transfer contract operation'
				},
				{
					methodInput: random.generateRandomHashString(32, '234thygdf'),
					mockResponseData: [
						{
							response: { data: {error: 'Invalid transaction'}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: `Generic error response`
				}
			]
		},
		{
			api: 'gamecredits',
			apiBaseAddress: 'http://blockexplorer.gamecredits.com',
			urlFormatters: {
				account: '/api/addresses/[0]/balance',
				block: '/api/blocks/[0]',
				blockHeight: '/api/blocks?height=[0]',
				transaction: '/api/transactions/[0]'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, 'asdfghbfgff'),
					mockResponseData: [
						{
							response: { data: `${random.generateRandomIntInclusive(1, 5000000, '1234233')}`, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: { address: random.generateRandomHashString(32, 'asdfghbfgff'), balance: random.generateRandomIntInclusive(1, 5000000, '1234233') },
					extraTestInfo: 'Valid account address'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '234radsf'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						},
						{
							response: { data: {hash: random.generateRandomHashString(32, '234radsf')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '234radsf')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000, '423wraedf'),
					mockResponseData: [
						{
							response: { data: {height: random.generateRandomIntInclusive(1, 5000000, '423wraedf')}, statusCode: 200 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						}
					],
					expectedResult: {height: random.generateRandomIntInclusive(1, 5000000, '423wraedf')},
					extraTestInfo: 'Valid block height'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '23rtsgf'),
					mockResponseData: [
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '23rtsgf'),
									vin: [ { prev_txid: random.generateRandomHashString(32, 'asrhgwe5t'), vout_index: 0 }, { prev_txid: random.generateRandomHashString(32, '2radgfsg'), vout_index: 0 } ]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						},
						{
							response: { data: { txid: random.generateRandomHashString(32, 'asrhgwe5t'), vout: [{ addresses: [random.generateRandomHashString(32, 'a235tgb')], value: random.generateRandomIntInclusive(1, 1000, 'fdgw3455')}] }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, 'asrhgwe5t') ]
						},
						{
							response: { data: { txid: random.generateRandomHashString(32, '2radgfsg'), vout: [{ addresses: [random.generateRandomHashString(32, 'asdgbg')], value: random.generateRandomIntInclusive(1, 1000, '35yjtgdhf')}] }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '2radgfsg') ]
						}
					],
					expectedResult: {
						txid: random.generateRandomHashString(32, '23rtsgf'),
						vin: [
							{
								address: random.generateRandomHashString(32, 'a235tgb'),
								prev_txid: random.generateRandomHashString(32, 'asrhgwe5t'),
								value: random.generateRandomIntInclusive(1, 1000, 'fdgw3455'),
								vout_index: 0
							},
							{
								address: random.generateRandomHashString(32, 'asdgbg'),
								prev_txid: random.generateRandomHashString(32, '2radgfsg'),
								value: random.generateRandomIntInclusive(1, 1000, '35yjtgdhf'),
								vout_index: 0
							}
						]
					},
					extraTestInfo: 'Valid transaction hash'
				}
			]
		},
		{
			api: 'insight',
			networks: {
				dcr: {
					apiBaseAddress: 'https://mainnet.decred.org'
				},
				dgb: {
					apiBaseAddress: 'https://digiexplorer.info'
				},
				kmd: {
					apiBaseAddress: 'http://kmd.explorer.supernet.org'
				},
				rdd: {
					apiBaseAddress: 'http://live.reddcoin.com'
				}
			},
			urlFormatters: {
				account: '/api/addr/[0]',
				block: '/api/block/[0]',
				blockIndex: '/api/block-index/[0]',
				transaction: '/api/tx/[0]'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, '2345trgfdsghf'),
					mockResponseData: [
						{
							response: { data: {addrStr: random.generateRandomHashString(32, '2345trgfdsghf')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {addrStr: random.generateRandomHashString(32, '2345trgfdsghf')},
					extraTestInfo: 'Valid account address'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '3425654'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, '3425654')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '3425654')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: `${random.generateRandomIntInclusive(1, 5000000, '234t5ydhfg')}`,
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {blockHash: random.generateRandomHashString(32, '234rasdf')}, statusCode: 200 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						},
						{
							response: { data: {height: random.generateRandomIntInclusive(1, 5000000, '234t5ydhfg')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ random.generateRandomHashString(32, '234rasdf') ]
						}
					],
					expectedResult: {height: random.generateRandomIntInclusive(1, 5000000, '234t5ydhfg')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomHashString(32, '453trgh'),
					mockResponseData: [
						{
							response: { data: { hash: random.generateRandomHashString(32, 're4tgdfh'), height: random.generateRandomIntInclusive(1, 5000000, 'sldkjf') }, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Incorrect block response'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '345456456'),
					mockResponseData: [
						{
							response: { data: {txid: random.generateRandomHashString(32, '345456456')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {txid: random.generateRandomHashString(32, '345456456')},
					extraTestInfo: 'Valid transaction hash'
				}
			]
		}
	];
	
	/*
	 *
	 *  constructor
	 *
	 */
	describe('constructor', function() {
		const multiNetworkApiTests = _.filter(tests, (test) => typeof(test.networks) === 'object');
		
		multiNetworkApiTests.forEach((test) => {
			describe(test.api, function() {
				_.each(test.networks, (data, network) => {
					it(`should construct a valid client for '${network}' network`, function() {
						assert.doesNotThrow(() => new this[test.api](network), Error);
					});
				});

				it(`should not construct a valid client for unsupported networks`, function() {
					assert.throws(() => new this[test.api]('asdfssafdsdfa'), Error);
				});
			});
		});
	});
	
	/*
	 *
	 *  getAccount
	 *
	 */
	describe('getAccount', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'getAccount', 'account');
		});
	});
	
	/*
	 *
	 *  getBlockByNumberOrHash
	 *
	 */
	describe('getBlockByNumberOrHash', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'getBlockByNumberOrHash', 'block');
		});
	});
	
	/*
	 *
	 *  getTransaction
	 *
	 */
	describe('getTransaction', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'getTransaction', 'transaction');
		});
	});
});