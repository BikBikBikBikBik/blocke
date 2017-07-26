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
function generateCurrency(options, includeAccount = true) {
	const currencyData = {
		definitions: generateDefinitions(includeAccount),
		name: options.currencyName
	};
	options.optionDefinitions = currencyData.definitions;
	currencyData.usage = generateUsage(options, includeAccount);
	
	return currencyData;
}

function generateDefinitions(includeAccount) {
	let definitions = [
		{
			name: 'block',
			alias: 'b',
			type: String,
			multiple: true,
			typeLabel: '[underline]{Hash} or [underline]{Number}',
			description: 'Block number or hash. Separate list with spaces.'
		},
		{
			name: 'transaction',
			alias: 't',
			type: String,
			multiple: true,
			typeLabel: '[underline]{Hash}',
			description: 'Transaction hash. Separate list with spaces.'
		}
	];
	
	if (includeAccount === true) {
		definitions = [{
			name: 'account',
			alias: 'a',
			type: String,
			multiple: true,
			typeLabel: '[underline]{Address}',
			description: 'Account address. Separate list with spaces.'
		}].concat(definitions);
	}
	
	return definitions;
}

function generateUsage(options, includeAccount) {
	let usage = [
		{
			header: `blocke ${options.command}`,
			content: `Query the ${options.currencyName} blockchain. If no option is specified blocke will search for the right type of the value.`
		},
		{
			header: 'Synopsis',
			content: `blocke ${options.command} <option>`
		},
		{
			header: 'Options',
			optionList: options.optionDefinitions
		},
		{
			header: 'Examples',
			content: [
				{ name: 'Get block by hash', summary: `blocke ${options.command} -b ${options.optionSamples.blockHash}` },
				{ name: 'Get block by number', summary: `blocke ${options.command} -b ${options.optionSamples.blockNumber}` },
				{ name: 'Get multiple blocks ', summary: `blocke ${options.command} -b ${options.optionSamples.blockNumber} ${options.optionSamples.blockNumber - 12345} ${options.optionSamples.blockHash}` },
				{ name: 'Get block and transaction', summary: `blocke ${options.command} -b ${options.optionSamples.blockNumber} -t ${options.optionSamples.transactionHash}` },
				{ name: 'Get transaction by hash', summary: `blocke ${options.command} -t ${options.optionSamples.transactionHash}` },
				{ name: 'Search for value', summary: `blocke ${options.command} ${options.optionSamples.blockHash}` },
			]
		}
	];
	
	if (includeAccount === true) {
		usage[3].content = [
			{ name: 'Get account by address', summary: `blocke ${options.command} -a ${options.optionSamples.account}` },
			{ name: 'Get account and block', summary: `blocke ${options.command} -a ${options.optionSamples.account} -b ${options.optionSamples.blockNumber}` },
		].concat(usage[3].content);
	}
	
	return usage;
}

exports.generateCurrency = generateCurrency;