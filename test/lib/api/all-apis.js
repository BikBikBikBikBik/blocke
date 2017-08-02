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
const _ = require('underscore');

describe('lib/api/*', function() {
	function prepareMockHttpResponses(test, testData, apiData, networkForApiUrl) {
		testData.mockResponseData.forEach((mockResponse) => {
			const apiBaseAddress = apiData.hasOwnProperty('apiBaseAddress') ? apiData.apiBaseAddress : test.apiBaseAddress;
			let urlSuffix = test.urlFormatters[mockResponse.urlFormatter];

			_.each(mockResponse.values, (replacementValue, index) => {
				const actualValue = ((value) => {
					switch (replacementValue) {
						case '[input]':
							return testData.methodInput;

						case '[network]':
							return networkForApiUrl;

						default:
							return replacementValue;
					}
				})(replacementValue);

				urlSuffix = urlSuffix.replace(`[${index}]`, actualValue);
			});

			nock(apiBaseAddress).get(urlSuffix).reply(mockResponse.response.statusCode, mockResponse.response.data);
		});
	}
	
	function runTestForApiClientMethod(test, methodName, objectName) {
		describe(test.api, function() {
			const apiArray = typeof(test.networks) === 'object' ? _.map(test.networks, (data, network) => {
				const apiData = { api: (self) => new self[test.api](network), network: network };
				if (data.hasOwnProperty('apiBaseAddress')) {
					apiData.apiBaseAddress = data.apiBaseAddress;
				}
				if (data.hasOwnProperty('replacement')) {
					apiData.replacement = data.replacement;
				}

				return apiData;
			}) : [{api: (self) => self[test.api]}];

			apiArray.forEach((apiData) => {
				const isMultiNetworkApi = apiData.hasOwnProperty('network');
				const networkForApiUrl = apiData.hasOwnProperty('replacement') ? apiData.replacement : apiData.network;

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
		this.etheradapter = require('../../../lib/api/etheradapter');
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
				xdn: { replacement: 'duck' },
				xmr: { replacement: 'mro' }
			},
			urlFormatters: {
				block: '/api/v1/[0]/blocks/[1]/full',
				transaction: '/api/v1/[0]/transactions/[1]/full'
			},
			getBlockByNumberOrHashTests: [
				{
					methodInput: '345645645667',
					mockResponseData: [
						{
							response: { data: {success: true}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {
						aeon: {success: true},
						bcn: {success: true},
						xdn: {success: true},
						xmr: {success: true},
					},
					extraTestInfo: 'Valid block id'
				},
				{
					methodInput: '0978785',
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
					methodInput: '23546',
					mockResponseData: [
						{
							response: { data: {code: 'RequestLimitExceeded'}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'RequestLimitExceeded response'
				},
				{
					methodInput: '456778',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'HTTP 400 response'
				},
				{
					methodInput: '698765',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'HTTP 404 response'
				},
				{
					methodInput: '34543667',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'HTTP 429 response'
				},
				{
					methodInput: '7585673',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'block',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.generateGenericObjectErrorMessage('Block'),
					extraTestInfo: 'HTTP 500 response'
				}
			],
			getTransactionTests: [
				{
					methodInput: '23423',
					mockResponseData: [
						{
							response: { data: {success: true}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedResult: {
						aeon: { success: true, valueDivisor: 1000000000000 },
						bcn: { success: true, valueDivisor: 100000000 },
						xdn: { success: true, valueDivisor: 100000000 },
						xmr: { success: true, valueDivisor: 1000000000000 },
					},
					extraTestInfo: 'Valid transaction hash'
				},
				{
					methodInput: '12334534',
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
					methodInput: '324546',
					mockResponseData: [
						{
							response: { data: {code: 'RequestLimitExceeded'}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'RequestLimitExceeded response'
				},
				{
					methodInput: '345345',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'HTTP 400 response'
				},
				{
					methodInput: '2435354',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'HTTP 404 response'
				},
				{
					methodInput: '23543345',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'HTTP 429 response'
				},
				{
					methodInput: '2343534',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'transaction',
							values: [ '[network]', '[input]' ]
						}
					],
					expectedError: apiResources.generateGenericObjectErrorMessage('Transaction'),
					extraTestInfo: 'HTTP 500 response'
				}
			]
		},
		{
			api: 'insight',
			networks: {
				dcr: {
					apiBaseAddress: 'https://mainnet.decred.org/'
				},
				dgb: {
					apiBaseAddress: 'https://digiexplorer.info/'
				},
				kmd: {
					apiBaseAddress: 'http://kmd.explorer.supernet.org/'
				},
				rdd: {
					apiBaseAddress: 'http://live.reddcoin.com/'
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
					methodInput: '2345trgfdsghf',
					mockResponseData: [
						{
							response: { data: {addrStr: '2345trgfdsghf'}, statusCode: 200 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedResult: {addrStr: '2345trgfdsghf'},
					extraTestInfo: 'Valid account address'
				},
				{
					methodInput: '234trgsdfhss',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.accountNotFoundMessage,
					extraTestInfo: 'HTTP 400 response'
				},
				{
					methodInput: '23trsgfdffds',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.accountNotFoundMessage,
					extraTestInfo: 'HTTP 404 response'
				},
				{
					methodInput: 'AFDGSFGBDJH',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'HTTP 429 response'
				},
				{
					methodInput: 'asgfsghnjfd',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'account',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.generateGenericObjectErrorMessage('Account'),
					extraTestInfo: 'HTTP 500 response'
				}
			],
			getBlockByNumberOrHashTests: [
				{
					methodInput: '3425654',
					mockResponseData: [
						{
							response: { data: {hash: '3425654'}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
					],
					expectedResult: {hash: '3425654'},
					extraTestInfo: 'Valid block hash'
				},
				{
					methodInput: '1234',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {blockHash: '0808'}, statusCode: 200 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						},
						{
							response: { data: {height: 1234}, statusCode: 200 },
							urlFormatter: 'block',
							values: [ '0808' ]
						}
					],
					expectedResult: {height: 1234},
					extraTestInfo: 'Valid block height'
				},
				{
					methodInput: '234t5ryghf',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'HTTP 400 response'
				},
				{
					methodInput: '235t4yrgh',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.blockNotFoundMessage,
					extraTestInfo: 'HTTP 404 response'
				},
				{
					methodInput: '2345tyrhgf',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						}
						,
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'HTTP 429 response'
				},
				{
					methodInput: 'qweasdfg3454',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'block',
							values: [ '[input]' ]
						},
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'blockIndex',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.generateGenericObjectErrorMessage('Block'),
					extraTestInfo: 'HTTP 500 response'
				}
			],
			getTransactionTests: [
				{
					methodInput: '345456456',
					mockResponseData: [
						{
							response: { data: {success: true}, statusCode: 200 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedResult: {success: true},
					extraTestInfo: 'Valid transaction hash'
				},
				{
					methodInput: '876iuykhjgf',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 400 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'HTTP 400 response'
				},
				{
					methodInput: 'ghjkkr788',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 404 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.transactionNotFoundMessage,
					extraTestInfo: 'HTTP 404 response'
				},
				{
					methodInput: '4678ikutjhhfg',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 429 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.tooManyRequestsMessage,
					extraTestInfo: 'HTTP 429 response'
				},
				{
					methodInput: '4356uiyktjhgf',
					mockResponseData: [
						{
							response: { data: {success: false}, statusCode: 500 },
							urlFormatter: 'transaction',
							values: [ '[input]' ]
						}
					],
					expectedError: apiResources.generateGenericObjectErrorMessage('Transaction'),
					extraTestInfo: 'HTTP 500 response'
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