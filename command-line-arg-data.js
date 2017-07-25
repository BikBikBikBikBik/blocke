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
const dataGenerator = require('./command-line-arg-data-generator');

/*
 *
 *  Currencies
 *
 */
const aeon = dataGenerator.generateCurrency({
	command: 'aeon',
	currencyName: 'Aeon',
	optionSamples: {
		blockHash: '8089007cb483e1321c70fbb6ea11082ca733e92ffbb92311a06bd58c9cdd79f5',
		blockNumber: 845900,
		transactionHash: 'efb393f88d66561b908053099cf35f5e12227084eeb1288383179177f927452c'
	}
}, false);

const btc = dataGenerator.generateCurrency({
	command: 'btc',
	currencyName: 'Bitcoin',
	optionSamples: {
		account: '19SokJG7fgk8iTjemJ2obfMj14FM16nqzj',
		blockHash: '0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a',
		blockNumber: 371623,
		transactionHash: '5756ff16e2b9f881cd15b8a7e478b4899965f87f553b6210d0f8e5bf5be7df1d'
	}
});

const dash = dataGenerator.generateCurrency({
	command: 'dash',
	currencyName: 'Dash',
	optionSamples: {
		account: 'XbkfLoZhNXDBu1i6aNuxQ19WcM2VfE42wG',
		blockHash: '00000000000002958852d255726d695ecccfbfacfac318a9d0ebc558eecefeb9',
		blockNumber: 700000,
		transactionHash: 'dbe0d951529f6ff5a0d2a656908d3c3a45cd89e4aacfea104d95b7112ae8a924'
	}
});

const dcr = dataGenerator.generateCurrency({
	command: 'dcr',
	currencyName: 'Decred',
	optionSamples: {
		account: 'DsiFdJ2RjLFPM9bTtvn16j3hLvBrcjYK1n3',
		blockHash: '00000000000000ab859cf034f1048deee4a75e206a7e9a73befdeba6c69b8c08',
		blockNumber: 153050,
		transactionHash: 'b1ea1adf3236afee8b15167f130dfc8ec18dd1160e9e5400fc8d9842ad8a71fc'
	}
});

const doge = dataGenerator.generateCurrency({
	command: 'doge',
	currencyName: 'Dogecoin',
	optionSamples: {
		account: 'DFQc4NVAK7GvFQsHNciE8rcBw6t5ZQ3gdC',
		blockHash: 'c151a40f121a4f0ee0078e0268563c8299ad12652f939d9c6880aab9a93c1969',
		blockNumber: 1700000,
		transactionHash: '9f2ea5f34d3544ba9abad98251914e9408ba29272c35b6eaaa3abd2c00785a08'
	}
});

const eth = dataGenerator.generateCurrency({
	command: 'eth',
	currencyName: 'Ethereum',
	optionSamples: {
		account: '0x3e65303043928403f8a1a2ca4954386e6f39008c',
		blockHash: '0xb8a3f7f5cfc1748f91a684f20fe89031202cbadcd15078c49b85ec2a57f43853',
		blockNumber: 4000000,
		transactionHash: '0xf40201acac05384548e6053d3cd2a52c43779bd9a22f054374a9d95f6f1e0886'
	}
});

const kmd = dataGenerator.generateCurrency({
	command: 'kmd',
	currencyName: 'Komodo',
	optionSamples: {
		account: 'RXbb9PkefXcsqq8wqiUZZUuq8e3p29mw1G',
		blockHash: '0b76655d4f4b39b9ca2ddecc9a435ca7479eac5af1c745d9b6bfe7af7298b79a',
		blockNumber: 419556,
		transactionHash: '516ad5680feb7779f3af7b47ceb036989fe19c9c00d9543d11d7abec81e79bc2'
	}
});

const ltc = dataGenerator.generateCurrency({
	command: 'ltc',
	currencyName: 'Litecoin',
	optionSamples: {
		account: 'LQB2bZJvC4oGvf63eWebX3n54qquWoPhcH',
		blockHash: '3003cfd2f8ec96c1deb3fc09df99b820189a48a93387882edb83027b507bf7f2',
		blockNumber: 1200000,
		transactionHash: 'bc6a355ec34194e43a590e86386a771af15c1eb88cc5ce614920a76e36388fe1'
	}
});

const sc = dataGenerator.generateCurrency({
	command: 'sc',
	currencyName: 'Siacoin',
	optionSamples: {
		blockHash: '0000000000000028ecc091235afb82bd9aca66ebf175137336191ec1d28be993',
		blockNumber: 115300,
		transactionHash: '3cb16b2faeb14244829bdcc77e9b46363e6fd0981945b4195e40332bb3347055'
	}
}, false);

const vtc = dataGenerator.generateCurrency({
	command: 'vtc',
	currencyName: 'Vertcoin',
	optionSamples: {
		account: 'VkdFmDNm7geGEWLHiPvEEaaPs2fAD7bmdc',
		blockHash: '1b52cf30a05eba4be3bab57303aecc55092ecb44e65b94a7c46fd3a82ef3ec4c',
		blockNumber: 750100,
		transactionHash: '8f5de2a5417169e89d4104984a7c6e6d520d2ab467c963e18b543bfc6a52786c'
	}
});

const waves = dataGenerator.generateCurrency({
	command: 'waves',
	currencyName: 'Waves',
	optionSamples: {
		account: '3P51e7GJUTR6hQXq7UTdaX5H4SA1U6gRryn',
		blockHash: '45ZELbZm5PNXhdixKMniPjU4hGZNyYY53vGVcxAmG76R9ZAwX89p5neMc9MH4ucP5S1E3pePHc99BMUJ8n2xk34',
		blockNumber: 590750,
		transactionHash: 'GQcZj4wFnMBqpGYNu7DW4ZwNQSQSAsH7jnGe9eJXxyWH'
	}
});

const xmr = dataGenerator.generateCurrency({
	command: 'xmr',
	currencyName: 'Monero',
	optionSamples: {
		blockHash: 'a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721',
		blockNumber: 1000000,
		transactionHash: 'dbb1ddacd2ae0137752f0e761adcab64d463a0f74d1f506f49cd92a11b336bf1'
	}
}, false);

const zec = dataGenerator.generateCurrency({
	command: 'zec',
	currencyName: 'Zcash',
	optionSamples: {
		account: 't3K4aLYagSSBySdrfAGGeUd5H9z5Qvz88t2',
		blockHash: '00000000130f2314d98ddfeea36edbce4aacabe06798c26711b25463923550b8',
		blockNumber: 150000,
		transactionHash: 'b3a06b6cda21dcae2b515917769deb04b7b90c2bf99cb674569c33af382de7bc'
	}
});

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
				{ name: 'aeon', summary: aeon.usage[0].content },
				{ name: 'btc', summary: btc.usage[0].content },
				{ name: 'dash', summary: dash.usage[0].content },
				{ name: 'dcr', summary: dcr.usage[0].content },
				{ name: 'doge', summary: doge.usage[0].content },
				{ name: 'eth', summary: eth.usage[0].content },
				{ name: 'kmd', summary: kmd.usage[0].content },
				{ name: 'ltc', summary: ltc.usage[0].content },
				{ name: 'sc', summary: sc.usage[0].content },
				{ name: 'vtc', summary: xmr.usage[0].content },
				{ name: 'waves', summary: sc.usage[0].content },
				{ name: 'xmr', summary: xmr.usage[0].content },
				{ name: 'zec', summary: zec.usage[0].content }
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
		content: [{ name: 'help', summary: 'Display help.' }]
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
	aeon: aeon,
	btc: btc,
	bitcoin: btc,
	dash: dash,
	dcr: dcr,
	decred: dcr,
	doge: doge,
	dogecoin: doge,
	eth: eth,
	ethereum: eth,
	kmd: kmd,
	komodo: kmd,
	ltc: ltc,
	litecoin: ltc,
	sc: sc,
	siacoin: sc,
	vtc: vtc,
	vertcoin: vtc,
	waves: waves,
	xmr: xmr,
	monero: xmr,
	zec: zec,
	zcash: zec,
	help: help,
	null: nullData
};