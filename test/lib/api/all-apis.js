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
			addGenericErrorTests(test, 'getBlockByNumberTests', apiResources.blockNotFoundMessage, 'Block');
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
			
			if (Array.isArray(apiData.urlFormatterReplacements)) {
				apiData.urlFormatterReplacements.forEach((urlReplacement) => {
					urlSuffix = urlSuffix.replace(urlReplacement.old, urlReplacement.new);
				});
			}

			_.each(mockResponse.values, (replacementValue, index) => {
				const actualValue = (() => {
					switch (replacementValue) {
						case '[input]':
							return Array.isArray(testData.methodInput) ? testData.methodInput[0] : testData.methodInput;

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
	
	function runTestForApiClientMethod(test, methodName, objectName, isStandardMethod = true) {
		if (addAllGenericErrorTestsWasCalled === false) {
			addAllGenericErrorTests();
			
			addAllGenericErrorTestsWasCalled = true;
		}
		
		describe(test.api, function() {
			const apiArray = typeof(test.networks) === 'object' ? _.map(test.networks, (data, network) => {
				const apiData = { api: (self) => new self[test.api](network), isMultiNetworkApi: true, network: network };
				if (data.hasOwnProperty('apiBaseAddress')) {
					apiData.apiBaseAddress = data.apiBaseAddress;
				}
				if (data.hasOwnProperty('networkAlias')) {
					apiData.networkAlias = data.networkAlias;
				}
				if (data.hasOwnProperty('urlFormatterReplacements')) {
					apiData.urlFormatterReplacements = data.urlFormatterReplacements;
				}

				return apiData;
			}) : [{api: (self) => self[test.api]}];

			apiArray.forEach((apiData) => {
				const networkForApiUrl = apiData.hasOwnProperty('networkAlias') ? apiData.networkAlias : apiData.network;

				function runTests() {
					if (test.hasOwnProperty(`${methodName}Tests`)) {
						function callApiMethod(self, testData) {
							const apiInstance = apiData.api(self);
							const apiMethod = apiInstance[methodName];
							
							return Array.isArray(testData.methodInput) ? apiMethod.apply(apiInstance, testData.methodInput) : (apiMethod.bind(apiInstance, testData.methodInput))();
						}
						
						const successAndErrorTests = _.partition(test[`${methodName}Tests`], (testData) => testData.hasOwnProperty('expectedResult'));

						successAndErrorTests[0].forEach((testData) => {
							it(`should return a ${objectName} (${testData.extraTestInfo})`, function(done) {
								const expectedResult = testData.expectedResult.hasOwnProperty(apiData.network) ? testData.expectedResult[apiData.network] : testData.expectedResult;

								prepareMockHttpResponses(test, testData, apiData, networkForApiUrl);

								callApiMethod(this, testData).should.eventually.deep.equal(expectedResult).and.notify(done);
							});
						});

						successAndErrorTests[1].forEach((testData) => {
							it(`should not return a ${objectName} (${testData.extraTestInfo})`, function(done) {
								const expectedError = testData.expectedError.hasOwnProperty(apiData.network) ? testData.expectedError[apiData.network] : testData.expectedError;

								prepareMockHttpResponses(test, testData, apiData, networkForApiUrl);

								callApiMethod(this, testData).should.eventually.be.rejectedWith(expectedError).and.notify(done);
							});
						});
					} else if (isStandardMethod === true) {
						it(`should not return a ${objectName} (Operation not supported)`, function(done) {
							apiData.api(this)[methodName]().should.eventually.be.rejectedWith(apiResources.operationNotSupportedMessage).and.notify(done);
						});
					}
				}
				
				if (apiData.isMultiNetworkApi === true) {
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
				xdn: {networkAlias: 'duck'},
				xmr: {networkAlias: 'mro'}
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
					expectedError: apiResources.apiNotAvailableMessage,
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
					expectedError: apiResources.apiNotAvailableMessage,
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
					extraTestInfo: `Valid transaction hash with 'fetchVinAddresses' true`
				},
				{
					methodInput: [random.generateRandomHashString(32, '45ythdgh'), false],
					mockResponseData: [
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '45ythdgh'),
									vin: [{ prev_txid: random.generateRandomHashString(32, '54rhgf'), vout_index: 0 }]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: { txid: random.generateRandomHashString(32, '45ythdgh'), vin: [{ prev_txid: random.generateRandomHashString(32, '54rhgf'), vout_index: 0 }] },
					extraTestInfo: `Valid transaction hash with 'fetchVinAddresses' false`
				}
			],
			updateTransactionInputAddressesTests: [
				{
					methodInput: {vin: [{ prev_txid: random.generateRandomHashString(32, '54yrdhfg'), vout_index: 0 }]},
					mockResponseData: [
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '54yrdhfg'),
									vout: [{ addresses: [random.generateRandomHashString(32, '5tsehg')], value: random.generateRandomIntInclusive(1, 1000, '45yrhdf') }]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '54yrdhfg') ]
						}
					],
					expectedResult: {
						vin: [{
							address: random.generateRandomHashString(32, '5tsehg'),
							prev_txid: random.generateRandomHashString(32, '54yrdhfg'),
							value: random.generateRandomIntInclusive(1, 1000, '45yrhdf'),
							vout_index: 0
						}]
					},
					extraTestInfo: 'Valid transaction inputs'
				}
			]
		},
		{
			api: 'insight',
			networks: {
				bch: { apiBaseAddress: 'http://blockdozer.com', urlFormatterReplacements: [{ new: '/insight-api/', old: '/api/' }] },
				dcr: {apiBaseAddress: 'https://mainnet.decred.org'},
				dgb: {apiBaseAddress: 'https://digiexplorer.info'},
				kmd: {apiBaseAddress: 'http://kmd.explorer.supernet.org'},
				rdd: {apiBaseAddress: 'http://live.reddcoin.com'}
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
		},
		{
			api: 'lisk',
			apiBaseAddress: 'https://explorer.lisk.io',
			urlFormatters: {
				account: '/api/getAccount?address=[0]',
				block: '/api/getBlock?blockId=[0]',
				search: '/api/search?id=[0]',
				transaction: '/api/getTransaction?transactionId=[0]'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, '234resgf'),
					mockResponseData: [
						{
							response: { data: {address: random.generateRandomHashString(32, '234resgf')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '234resgf')},
					extraTestInfo: 'Valid account address'
				},
				{
					methodInput: random.generateRandomHashString(32, '4tgrt'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.accountNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '234resgdf'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, '234resgdf')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '234resgdf')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000, 'rewgftgh'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: { id: random.generateRandomHashString(32, 'dsffghbh'), type: 'block' }, statusCode: 200 },
							urlFormatter: 'search',
							values: [ '[input]' ]
						},
						{
							response: { data: {hash: random.generateRandomHashString(32, 'dsffghbh')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ random.generateRandomHashString(32, 'dsffghbh') ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, 'dsffghbh')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomHashString(32, 'ritsuhgd'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 200 },
							urlFormatter: 'search',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Invalid block id',
					useAsErrorTestResponseTemplate: true
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, 'sadgh3'),
					mockResponseData: [
						{
							response: { data: {txid: random.generateRandomHashString(32, 'sadgh3')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {txid: random.generateRandomHashString(32, 'sadgh3')},
					extraTestInfo: 'Valid transaction hash'
				},
				{
					methodInput: random.generateRandomHashString(32, '4tgrt'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			]
		},
		{
			api: 'siatech',
			apiBaseAddress: 'https://explore.sia.tech',
			urlFormatters: {
				block: '/explorer/blocks/[0]',
				hash: '/explorer/hashes/[0]',
			},
			getBlockByNumberOrHashTests: [
				{
					methodInput: `${random.generateRandomIntInclusive(1, 5000000, 'asdfvbn')}`,
					mockResponseData: [
						{
							response: { data: {block: {height: random.generateRandomIntInclusive(1, 5000000, 'asfdghj')}}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: { block: {hash: random.generateRandomHashString(32, 'mdfggsdf')}, hashtype: 'blockid' }, statusCode: 200 },
							urlFormatter: 'hash',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, 'mdfggsdf')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: `${random.generateRandomIntInclusive(1, 5000000, '2435rtgf')}`,
					mockResponseData: [
						{
							response: { data: {block: {height: random.generateRandomIntInclusive(1, 5000000, '2435rtgf')}}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {height: random.generateRandomIntInclusive(1, 5000000, '2435rtgf')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: `${random.generateRandomIntInclusive(1, 5000000, 'afkjhln')}`,
					mockResponseData: [
						{
							response: { data: {block: {height: random.generateRandomIntInclusive(1, 5000000, '324t5rg')}}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'hash',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Invalid block id'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, 'fdsghfdnb'),
					mockResponseData: [
						{
							response: { data: { hashtype: 'transactionid', txid: random.generateRandomHashString(32, 'fdsghfdnb') }, statusCode: 200 },
							urlFormatter: 'hash',
							values: [ '[input]' ]
						}
					],
					expectedResult: { hashtype: 'transactionid', txid: random.generateRandomHashString(32, 'fdsghfdnb') },
					extraTestInfo: 'Valid transaction hash'
				},
				{
					methodInput: random.generateRandomHashString(32, '43erwtdgfh'),
					mockResponseData: [
						{
							response: { data: {hashtype: random.generateRandomHashString(10, '45tergfd')}, statusCode: 200 },
							urlFormatter: 'hash',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'Non-transaction hash'
				}
			]
		},
		{
			api: 'sochain',
			apiBaseAddress: 'https://chain.so',
			networks: {
				BTC: {},
				DASH: {},
				DOGE: {},
				LTC: {}
			},
			urlFormatters: {
				account: '/api/v2/get_address_balance/[0]/[1]',
				block: '/api/v2/get_block/[0]/[1]',
				transaction: '/api/v2/get_tx/[0]/[1]'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, '98uiojk'),
					mockResponseData: [
						{
							response: { data: {data: {address: random.generateRandomHashString(32, '98uiojk')}}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '98uiojk')},
					extraTestInfo: 'Valid account address'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, 'kiujhg'),
					mockResponseData: [
						{
							response: { data: {data: {hash: random.generateRandomHashString(32, 'kiujhg')}}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, 'kiujhg')},
					extraTestInfo: 'Valid block id'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '76uyjhg'),
					mockResponseData: [
						{
							response: { data: {data: {txid: random.generateRandomHashString(32, '76uyjhg')}}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {txid: random.generateRandomHashString(32, '76uyjhg')},
					extraTestInfo: 'Valid transaction hash'
				}
			]
		},
		{
			api: 'vtconline',
			apiBaseAddress: 'https://explorer.vtconline.org',
			urlFormatters: {
				account: '/ext/getaddress/[0]',
				blockHash: '/api/getblock?hash=[0]',
				blockHeight: '/api/getblockhash?index=[0]',
				transaction: '/api/getrawtransaction?txid=[0]&decrypt=1'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, '45terfg'),
					mockResponseData: [
						{
							response: { data: {address: random.generateRandomHashString(32, '45terfg')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '45terfg')},
					extraTestInfo: 'Valid account address'
				},
				{
					methodInput: random.generateRandomHashString(32, '65yrtgd'),
					mockResponseData: [
						{
							response: { data: {error: 'Invalid account'}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.accountNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			],
			getBlockByNumberTests: [
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000, '243thds'),
					mockResponseData: [
						{
							response: { data: random.generateRandomHashString(32, '234trehgf'), statusCode: 200 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						},
						{
							response: { data: {hash: random.generateRandomHashString(32, '234trehgf')}, statusCode: 200 },
							urlFormatter: 'blockHash',
							values: [ random.generateRandomHashString(32, '234trehgf') ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '234trehgf')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000),
					mockResponseData: [
						{
							response: { data: 'There was an error.', statusCode: 200 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '54trhgf'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, '54trhgf')}, statusCode: 200 },
							urlFormatter: 'blockHash',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '54trhgf')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000, '35y4rhy'),
					mockResponseData: [
						{
							response: { data: 'Invalid block hash', statusCode: 200 },
							urlFormatter: 'blockHash',
							values: [ '[input]' ]
						},
						{
							response: { data: random.generateRandomHashString(32, '3654yujt'), statusCode: 200 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						},
						{
							response: { data: {hash: random.generateRandomHashString(32, '3654yujt')}, statusCode: 200 },
							urlFormatter: 'blockHash',
							values: [ random.generateRandomHashString(32, '3654yujt') ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '3654yujt')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000),
					mockResponseData: [
						{
							response: { data: 'There was an error.', statusCode: 200 },
							urlFormatter: 'blockHash',
							values: [ '[input]' ]
						},
						{
							response: { data: 'There was an error.', statusCode: 200 },
							urlFormatter: 'blockHeight',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Invalid block id'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '234tergsx'),
					mockResponseData: [
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '234tergsx'),
									vin: [{ txid: random.generateRandomHashString(32, '7rssfbsd'), vout: random.generateRandomIntInclusive(1, 10, '2ioerfhdgj')}]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						},
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '7rssfbsd'),
									vout: [{
										n: random.generateRandomIntInclusive(1, 10, '2ioerfhdgj'),
										scriptPubKey: {addresses: [random.generateRandomHashString(32, '4rdsfghfdh')]},
										value: random.generateRandomIntInclusive(1, 1000, '2355trsgf')
									}]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '7rssfbsd') ]
						}
					],
					expectedResult: {
						txid: random.generateRandomHashString(32, '234tergsx'),
						vin: [{
							address: random.generateRandomHashString(32, '4rdsfghfdh'),
							txid: random.generateRandomHashString(32, '7rssfbsd'),
							value: random.generateRandomIntInclusive(1, 1000, '2355trsgf'),
							vout: random.generateRandomIntInclusive(1, 10, '2ioerfhdgj')
						}]
					},
					extraTestInfo: `Valid transaction hash with 'fetchVinAddresses' true`
				},
				{
					methodInput: [random.generateRandomHashString(32, '6545etd'), false],
					mockResponseData: [
						{
							response: { data: { txid: random.generateRandomHashString(32, '6545etd'), vin: [{txid: random.generateRandomHashString(32, '234erfgsd')}] }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: { txid: random.generateRandomHashString(32, '6545etd'), vin: [{txid: random.generateRandomHashString(32, '234erfgsd')}] },
					extraTestInfo: `Valid transaction hash with 'fetchVinAddresses' false`
				},
				{
					methodInput: random.generateRandomHashString(32, '78oiuljk'),
					mockResponseData: [
						{
							response: { data: 'Invalid transaction hash', statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'Generic error response'
				}
			],
			updateTransactionInputAddressesTests: [
				{
					methodInput: {vin: [{ txid: random.generateRandomHashString(32, '398eruigfj'), vout: random.generateRandomIntInclusive(1, 10, '324wtrregd') }]},
					mockResponseData: [
						{
							response: {
								data: {
									txid: random.generateRandomHashString(32, '398eruigfj'),
									vout: [{
										n: random.generateRandomIntInclusive(1, 10, '324wtrregd'),
										scriptPubKey: {addresses: [random.generateRandomHashString(32, '2534t4s')]},
										value: random.generateRandomIntInclusive(1, 1000, '2wsfgbx')
									}]
								},
								statusCode: 200
							},
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '398eruigfj') ]
						}
					],
					expectedResult: {
						vin: [{
							address: random.generateRandomHashString(32, '2534t4s'),
							txid: random.generateRandomHashString(32, '398eruigfj'),
							value: random.generateRandomIntInclusive(1, 1000, '2wsfgbx'),
							vout: random.generateRandomIntInclusive(1, 10, '324wtrregd')
						}]
					},
					extraTestInfo: 'Valid transaction inputs'
				}
			]
		},
		{
			api: 'wavesexplorer',
			apiBaseAddress: 'https://nodes.wavesnodes.com',
			urlFormatters: {
				account: '/addresses/balance/[0]',
				blockAt: '/blocks/at/[0]',
				blockSignature: '/blocks/signature/[0]',
				transaction: '/transactions/info/[0]'
			},
			getAccountTests: [
				{
					methodInput: `1W${random.generateRandomHashString(32, '3regfnvb')}`,
					mockResponseData: [
						{
							response: { data: {address: random.generateRandomHashString(32, '3regfnvb')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ random.generateRandomHashString(32, '3regfnvb') ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '3regfnvb')},
					extraTestInfo: `Valid account address with '1W' prefix`
				},
				{
					methodInput: random.generateRandomHashString(32, '678tuyhgf'),
					mockResponseData: [
						{
							response: { data: {address: random.generateRandomHashString(32, '678tuyhgf')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '678tuyhgf')},
					extraTestInfo: `Valid account address without '1W' prefix`,
					useAsErrorTestResponseTemplate: true
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, 'bncfy34'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, 'bncfy34')}, statusCode: 200 },
							urlFormatter: 'blockSignature',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, 'bncfy34')},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000, '56tryhfg'),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'blockSignature',
							values: [ '[input]' ]
						},
						{
							response: { data: {height: random.generateRandomIntInclusive(1, 5000000, '56tryhfg')}, statusCode: 200 },
							urlFormatter: 'blockAt',
							values: [ '[input]' ]
						}
					],
					expectedResult: {height: random.generateRandomIntInclusive(1, 5000000, '56tryhfg')},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: random.generateRandomIntInclusive(1, 5000000),
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'blockSignature',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'blockAt',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'Invalid block id'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '23wrtegf'),
					mockResponseData: [
						{
							response: { data: { height: random.generateRandomIntInclusive(1, 5000000, '978i7utyh'), txid: random.generateRandomHashString(32, '23wrtegf'), type: 4 }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						},
						{
							response: { data: {signature: random.generateRandomHashString(32, '98o8ikyujt')}, statusCode: 200 },
							urlFormatter: 'blockAt',
							values: [ random.generateRandomIntInclusive(1, 5000000, '978i7utyh') ]
						}
					],
					expectedResult: {
						blockHash:random.generateRandomHashString(32, '98o8ikyujt'),
						height: random.generateRandomIntInclusive(1, 5000000, '978i7utyh'),
						txid: random.generateRandomHashString(32, '23wrtegf'),
						type: 4,
						valueDivisor: 100000000,
						valueSymbol: ''
					},
					extraTestInfo: 'WAVES transfer'
				},
				{
					methodInput: random.generateRandomHashString(32, 'i87yujh'),
					mockResponseData: [
						{
							response: { data: { assetId: random.generateRandomHashString(32, '576tjg'), height: random.generateRandomIntInclusive(1, 5000000, '54tryghf'), txid: random.generateRandomHashString(32, 'i87yujh'), type: 4 }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						},
						{
							response: { data: { decimals: random.generateRandomIntInclusive(2, 8, '5rtfsd'), name: random.generateRandomHashString(5, '65rtyfg') }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '576tjg') ]
						},
						{
							response: { data: {signature: random.generateRandomHashString(32, '7rtgdf')}, statusCode: 200 },
							urlFormatter: 'blockAt',
							values: [ random.generateRandomIntInclusive(1, 5000000, '54tryghf') ]
						}
					],
					expectedResult: {
						assetId: random.generateRandomHashString(32, '576tjg'),
						blockHash: random.generateRandomHashString(32, '7rtgdf'),
						height: random.generateRandomIntInclusive(1, 5000000, '54tryghf'),
						txid: random.generateRandomHashString(32, 'i87yujh'),
						type: 4,
						valueDivisor: Math.pow(10, random.generateRandomIntInclusive(2, 8, '5rtfsd')),
						valueSymbol: random.generateRandomHashString(5, '65rtyfg')
					},
					extraTestInfo: 'Token transfer'
				},
				{
					methodInput: random.generateRandomHashString(32),
					mockResponseData: [
						{
							response: { data: {type: random.generateRandomIntInclusive(0, 3, '3refdg')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionTypeNotSupportedMessage(random.generateRandomIntInclusive(0, 3, '3refdg')),
					extraTestInfo: 'Non-asset transfer type'
				}
			],
			updateTransactionFromAssetInfoTests: [
				{
					methodInput: {assetId: random.generateRandomHashString(32, '254t5hrdg')},
					mockResponseData: [
						{
							response: { data: { decimals: random.generateRandomIntInclusive(2, 8, '67utydh'), name: random.generateRandomHashString(5, '7tyufhg') }, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ random.generateRandomHashString(32, '254t5hrdg') ]
						}
					],
					expectedResult: { assetId: random.generateRandomHashString(32, '254t5hrdg'), valueDivisor: Math.pow(10, random.generateRandomIntInclusive(2, 8, '67utydh')), valueSymbol: random.generateRandomHashString(5, '7tyufhg') },
					extraTestInfo: 'Valid asset info'
				}
			]
		},
		{
			api: 'zchain',
			apiBaseAddress: 'https://api.zcha.in',
			urlFormatters: {
				account: '/v2/mainnet/accounts/[0]',
				block: '/v2/mainnet/blocks/[0]',
				transaction: '/v2/mainnet/transactions/[0]'
			},
			getAccountTests: [
				{
					methodInput: random.generateRandomHashString(32, '789iuykhj'),
					mockResponseData: [
						{
							response: { data: {address: random.generateRandomHashString(32, '789iuykhj')}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {address: random.generateRandomHashString(32, '789iuykhj')},
					extraTestInfo: 'Valid account address'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: random.generateRandomHashString(32, '657yutghj'),
					mockResponseData: [
						{
							response: { data: {hash: random.generateRandomHashString(32, '657yutghj')}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: random.generateRandomHashString(32, '657yutghj')},
					extraTestInfo: 'Valid block id'
				}
			],
			getTransactionTests: [
				{
					methodInput: random.generateRandomHashString(32, '68uiyjh'),
					mockResponseData: [
						{
							response: { data: {txid: random.generateRandomHashString(32, '68uiyjh')}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {txid: random.generateRandomHashString(32, '68uiyjh')},
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
					assert.throws(() => new this[test.api](random.generateRandomHashString(4, 'sdfghdhdggh')), Error, apiResources.generateUnsupportedNetworkMessage(random.generateRandomHashString(4, 'sdfghdhdggh')));
				});
			});
		});
	});
	
	/*
	 *
	 *  Standard method tests
	 *
	 */
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
	
	/*
	 *
	 *  Non-standard method tests
	 *
	 */
	/*
	 *
	 *  getBlockByNumber
	 *
	 */
	describe('getBlockByNumber', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'getBlockByNumber', 'block', false);
		});
	});
	
	/*
	 *
	 *  updateTransactionFromAssetInfo
	 *
	 */
	describe('updateTransactionFromAssetInfo', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'updateTransactionFromAssetInfo', 'transaction', false);
		});
	});
	
	/*
	 *
	 *  updateTransactionInputAddresses
	 *
	 */
	describe('updateTransactionInputAddresses', function() {
		tests.forEach((test) => {
			runTestForApiClientMethod(test, 'updateTransactionInputAddresses', 'transaction', false);
		});
	});
});