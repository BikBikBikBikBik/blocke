#! /usr/bin/env node
const commandLineArgData = require('../command-line-arg-data');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage');
const version = require('../package.json').version;
const OptionRequestHandler = require('../option-request-handler');

const shortHandMap = {
	bitcoin: 'btc',
	ethereum: 'eth',
	litecoin: 'ltc',
	monero: 'xmr'
};
const validCommands = [
	null, 'help',
	'btc', 'bitcoin',
	'dash',
	'doge', 'dogecoin',
	'eth', 'ethereum',
	'ltc', 'litecoin',
	'xmr', 'monero'
];

function executeHandler(handler, usage) {
	handler.handleRequest().then(function(res) {
		console.log(res);
	}).catch(function(error) {
		if (typeof(error) === 'string') {
			console.log(error);
		} else {
			console.log(usage);
		}
	});
}

try {
	const { command, argv } = commandLineCommands(validCommands);
	const options = commandLineArgs(commandLineArgData[command].definitions, argv);
	const usage = commandLineUsage(commandLineArgData[command].usage);
	
	if (Object.keys(options).length === 0) {
		console.log(usage);
	} else {
		switch (command) {
			case null:
				if (options.version) {
					console.log(`v${version}`);
				}
			break;
				
			case 'help':
				if (options.command) {
					//Although --command is a default option and argv is set correctly, somehow 'help' ends up
					// as the value for --command instead of the contents of argv...
					if (options.command === 'help' && argv.length === 1) {
						console.log(commandLineUsage(commandLineArgData[argv[0]].usage));
					} else {
						console.log(commandLineUsage(commandLineArgData[options.command].usage));
					}
				}
			break;
			
			default:
				let shortHandCommand = command;
				if (shortHandMap.hasOwnProperty(command)) {
					shortHandCommand = shortHandMap[command];
				}
				
				let handler = new OptionRequestHandler(shortHandCommand, options);
				executeHandler(handler, usage);
			break;
		}
	}
} catch (e) {
	console.log(e);
}