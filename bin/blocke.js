#! /usr/bin/env node
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
	monero: 'xmr',
	siacoin: 'sc',
	zcash: 'zec'
};
const validCommands = Object.keys(commandLineArgData).concat([null]);

function executeHandler(handler, usage) {
	handler.handleRequest().then(function(res) {
		console.log(res.toString());
	}).catch(function(err) {
		if (typeof(err) === 'string') {
			console.log(err);
		} else {
			console.log(usage);
		}
	});
}

try {
	const { command, argv } = commandLineCommands(validCommands);
	const options = commandLineArgs(commandLineArgData[command].definitions, argv);
	const usage = commandLineUsage(commandLineArgData[command].usage);
	
	const noOptionsSpecified = Object.keys(options).length === 0;
	if (noOptionsSpecified && argv.length !== 1) {
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
				
				if (noOptionsSpecified) {
					options.unknown =  argv[0];
				}
				let handler = new OptionRequestHandler(shortHandCommand, options);
				executeHandler(handler, usage);
			break;
		}
	}
} catch (e) {
	if (e instanceof Error) {
		console.log(e.message);
	} else {
		console.log(commandLineUsage(commandLineArgData['null'].usage));
	}
}