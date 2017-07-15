function generateDefinitions(includeAccount = true) {
	let definitions = [
		{
			name: 'block',
			alias: 'b',
			type: String,
			typeLabel: '[underline]{Hash} or [underline]{Number}',
			description: 'Block number or hash'
		},
		{
			name: 'transaction',
			alias: 't',
			type: String,
			typeLabel: '[underline]{Hash}',
			description: 'Transaction hash'
		}
	];
	
	if (includeAccount === true) {
		definitions = [{
			name: 'account',
			alias: 'a',
			type: String,
			typeLabel: '[underline]{Address}',
			description: 'Account address'
		}].concat(definitions);
	}
	
	return definitions;
}

function generateUsage(options, includeAccount = true) {
	let usage = [
		{
			header: `blocke ${options.command}`,
			content: `Query the ${options.currencyName} blockchain. Only one option is supported per query.`
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
				{ name: 'Get transaction by hash', summary: `blocke ${options.command} -t ${options.optionSamples.transactionHash}` }
			]
		}
	];
	
	if (includeAccount === true) {
		usage[3].content = [{ name: 'Get account by address', summary: `blocke ${options.command} -a ${options.optionSamples.account}` }].concat(usage[3].content);
	}
	
	return usage;
}

exports.generateDefinitions = generateDefinitions;
exports.generateUsage = generateUsage;