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
const assert = require('../chai-setup');
const _ = require('underscore');

describe('lib/command-line-arg-data-usage-generator', function() {
	function validateDefinition(definitions, expectedDefinition) {
		const actualDefinition = _.find(definitions, (def) => def.name === expectedDefinition.name);

		assert.exists(actualDefinition);
		assert.equal(actualDefinition.alias, expectedDefinition.alias);
		assert.startsWith(actualDefinition.description, expectedDefinition.description);
		assert.equal(actualDefinition.multiple, expectedDefinition.multiple);
		assert.equal(actualDefinition.type, expectedDefinition.type);
	}
	
	function validateUsage(usage, inputOptions) {
		const includeAccount = inputOptions.optionSamples.hasOwnProperty('account');

		assert.isArray(usage);
		assert.lengthOf(usage, 4);

		const commandUsage = _.find(usage, (usg) => usg.header === `blocke ${inputOptions.command}`);
		assert.exists(commandUsage);
		assert.isString(commandUsage.content);
		assert.startsWith(commandUsage.content, `Query the ${inputOptions.currencyName} blockchain`);

		const synopsisUsage = _.find(usage, (usg) => usg.header === 'Synopsis');
		assert.exists(synopsisUsage);
		assert.isString(synopsisUsage.content);
		assert.startsWith(synopsisUsage.content, `blocke ${inputOptions.command} <option>`);

		const optionsUsage = _.find(usage, (usg) => usg.header === 'Options');
		assert.exists(optionsUsage);
		assert.notExists(optionsUsage.content);
		assert.isArray(optionsUsage.optionList);
		assert.lengthOf(optionsUsage.optionList, inputOptions.optionDefinitions.length);

		const expectedExamples = [
			{ name: 'Get block by hash', summary: `blocke ${inputOptions.command} -b ${inputOptions.optionSamples.blockHash}` },
			{ name: 'Get block by number', summary: `blocke ${inputOptions.command} -b ${inputOptions.optionSamples.blockNumber}` },
			{ name: 'Get multiple blocks ', summary: `blocke ${inputOptions.command} -b ${inputOptions.optionSamples.blockNumber} ${inputOptions.optionSamples.blockNumber - 12345} ${inputOptions.optionSamples.blockHash}` },
			{ name: 'Get block and transaction', summary: `blocke ${inputOptions.command} -b ${inputOptions.optionSamples.blockNumber} -t ${inputOptions.optionSamples.transactionHash}` },
			{ name: 'Get transaction by hash', summary: `blocke ${inputOptions.command} -t ${inputOptions.optionSamples.transactionHash}` },
			{ name: 'Search for value', summary: `blocke ${inputOptions.command} ${inputOptions.optionSamples.blockHash}` },
			{ name: 'Get account by address', summary: `blocke ${inputOptions.command} -a ${inputOptions.optionSamples.account}` },
			{ name: 'Get account and block', summary: `blocke ${inputOptions.command} -a ${inputOptions.optionSamples.account} -b ${inputOptions.optionSamples.blockNumber}` },
		];
		const examplesUsage = _.find(usage, (usg) => usg.header === 'Examples');
		assert.exists(examplesUsage);
		assert.isArray(examplesUsage.content);
		assert.lengthOf(examplesUsage.content, includeAccount ? expectedExamples.length : expectedExamples.length - 2);

		expectedExamples.forEach(function(example) {
			if (includeAccount || !example.name.includes('account')) {
				const generatedExample = _.find(examplesUsage.content, (content) => content.name === example.name);
				assert.exists(generatedExample);
				assert.equal(generatedExample.summary, example.summary);
			}
		});
	}
	
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.aeonOptions = {
			command: 'aeon',
			currencyName: 'Aeon',
			optionDefinitions: [{}, {}],
			optionSamples: {
				blockHash: '8089007cb483e1321c70fbb6ea11082ca733e92ffbb92311a06bd58c9cdd79f5',
				blockNumber: 845900,
				transactionHash: 'efb393f88d66561b908053099cf35f5e12227084eeb1288383179177f927452c'
			}
		};

		this.btcOptions = {
			command: 'btc',
			currencyName: 'Bitcoin',
			optionDefinitions: [{}, {}, {}],
			optionSamples: {
				account: '19SokJG7fgk8iTjemJ2obfMj14FM16nqzj',
				blockHash: '0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a',
				blockNumber: 371623,
				transactionHash: '5756ff16e2b9f881cd15b8a7e478b4899965f87f553b6210d0f8e5bf5be7df1d'
			}
		};
		
		this.dataUsageGenerator = require('../../lib/command-line-arg-data-usage-generator');

		this.expectedAccountDefinition = {
			alias: 'a',
			description: 'Account address',
			name: 'account',
			multiple: true,
			type: String
		};
		
		this.expectedBlockDefinition = {
			alias: 'b',
			description: 'Block number or hash',
			name: 'block',
			multiple: true,
			type: String
		};
		
		this.expectedNetworkDefinition = {
			name: 'network',
			alias: 'n',
			type: Boolean,
			description: 'Get network information.'
		};
		
		this.expectedTransactionDefinition = {
			alias: 't',
			description: 'Transaction hash',
			name: 'transaction',
			multiple: true,
			type: String
		};
	});
	
	/*
	 *
	 *  generateCurrency
	 *
	 */
	describe('generateCurrency', function() {
		it('should exclude account when no account option sample is provided', function() {
			const currency = this.dataUsageGenerator.generateCurrency(this.aeonOptions);
			
			validateDefinition(currency.definitions, this.expectedBlockDefinition);
			validateDefinition(currency.definitions, this.expectedNetworkDefinition);
			validateDefinition(currency.definitions, this.expectedTransactionDefinition);
			validateUsage(currency.usage, this.aeonOptions);
		});
		
		it('should include account when an account option sample is provided', function() {
			const currency = this.dataUsageGenerator.generateCurrency(this.btcOptions);
			
			validateDefinition(currency.definitions, this.expectedAccountDefinition);
			validateDefinition(currency.definitions, this.expectedBlockDefinition);
			validateDefinition(currency.definitions, this.expectedNetworkDefinition);
			validateDefinition(currency.definitions, this.expectedTransactionDefinition);
			validateUsage(currency.usage, this.btcOptions);
		});
	});
	
	/*
	 *
	 *  generateDefinitions
	 *
	 */
	describe('generateDefinitions', function() {
		it('should exclude account when includeAccount is false', function() {
			const definitions = this.dataUsageGenerator.generateDefinitions(false);
			
			assert.isArray(definitions);
			assert.lengthOf(definitions, 3);
			
			validateDefinition(definitions, this.expectedBlockDefinition);
			validateDefinition(definitions, this.expectedNetworkDefinition);
			validateDefinition(definitions, this.expectedTransactionDefinition);
		});
		
		it('should include account when includeAccount is true', function() {
			const definitions = this.dataUsageGenerator.generateDefinitions(true);
			
			assert.isArray(definitions);
			assert.lengthOf(definitions, 4);
			
			validateDefinition(definitions, this.expectedAccountDefinition);
			validateDefinition(definitions, this.expectedBlockDefinition);
			validateDefinition(definitions, this.expectedNetworkDefinition);
			validateDefinition(definitions, this.expectedTransactionDefinition);
		});
	});
	
	/*
	 *
	 *  generateUsage
	 *
	 */
	describe('generateUsage', function() {
		it('should exclude account when includeAccount is false', function() {
			const usage = this.dataUsageGenerator.generateUsage(this.aeonOptions, false);
			
			validateUsage(usage, this.aeonOptions);
		});
		
		it('should include account when includeAccount is true', function() {
			const usage = this.dataUsageGenerator.generateUsage(this.btcOptions, true);
			
			validateUsage(usage, this.btcOptions);
		});
	});
});