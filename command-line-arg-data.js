const dataGenerator = require('./command-line-arg-data-generator');

/*
 *
 *  Currencies
 *
 */
const btc = { definitions: dataGenerator.generateDefinitions() };
btc.usage = dataGenerator.generateUsage({
	command: 'btc',
	currencyName: 'Bitcoin',
	optionDefinitions: btc.definitions,
	optionSamples: {
		account: '19SokJG7fgk8iTjemJ2obfMj14FM16nqzj',
		blockHash: '0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a',
		blockNumber: 371623,
		transactionHash: '5756ff16e2b9f881cd15b8a7e478b4899965f87f553b6210d0f8e5bf5be7df1d'
	}
});

const eth = { definitions: dataGenerator.generateDefinitions() };
eth.usage = dataGenerator.generateUsage({
	command: 'eth',
	currencyName: 'Ethereum',
	optionDefinitions: eth.definitions,
	optionSamples: {
		account: '0x3e65303043928403f8a1a2ca4954386e6f39008c',
		blockHash: '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6',
		blockNumber: 4000000,
		transactionHash: '0xf40201acac05384548e6053d3cd2a52c43779bd9a22f054374a9d95f6f1e0886'
	}
});

const xmr = { definitions: dataGenerator.generateDefinitions(false) };
xmr.usage = dataGenerator.generateUsage({
	command: 'xmr',
	currencyName: 'Monero',
	optionDefinitions: xmr.definitions,
	optionSamples: {
		blockHash: 'a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721',
		blockNumber: 1000000,
		transactionHash: 'dbb1ddacd2ae0137752f0e761adcab64d463a0f74d1f506f49cd92a11b336bf1'
	}
}, false);

/*
 *
 *  Help
 *
 */
const help = {
	definitions: [
		{
			name: 'command',
			alias: 'c',
			type: String,
			description: 'Command name',
			defaultOption: true
		}
	],
	usage: [
		{
			header: 'blocke help',
			content: 'Display help for a specific command.'
		},
		{
			header: 'Synopsis',
			content: 'blocke help <command>'
		},
		{
			header: 'Command List',
			content: [
				{ name: 'btc', summary: btc.usage[0].content },
				{ name: 'eth', summary: eth.usage[0].content },
				{ name: 'xmr', summary: xmr.usage[0].content }
			]
		}
	]
};

/*
 *
 *  Null (no command specified)
 *
 */
const nullData = {
	definitions: [
		{
			name: 'version',
			alias: 'v',
			type: Boolean,
			description: 'Display version number'
		}
	]
};
nullData.usage = [
	{
		header: 'blocke',
		content: 'blocke is a multi-coin blockchain explorer.'
	},
	{
		header: 'Synopsis',
		content: 'blocke <command> <options>'
	},
	{
		header: 'Command List',
		content: [{ name: 'help', summary: 'Display help for a specific command.' }].concat(help.usage[2].content)
	},
	{
		header: 'Options',
		optionList: nullData.definitions
	}
];

/*
 *
 *  Module exports
 *
 */
module.exports = {
	btc: btc,
	bitcoin: btc,
	eth: eth,
	ethereum: eth,
	help: help,
	monero: xmr,
	null: nullData,
	xmr: xmr
};