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
const commandLineArgData = require('../lib/command-line-arg-data');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage');
const OptionRequestHandler = require('../lib/option-request-handler');
const version = require('../package.json').version;
const _ = require('underscore');

const validCommands = Object.keys(commandLineArgData).concat([null]);

function executeHandler(handler, usage) {
	handler.handleRequest().then((res) => {
		const resIsArray = Array.isArray(res);
		
		if (resIsArray && res.length > 1) {
			//[0] = Account results
			//[1] = The rest of the results
			const accountsAndOthers = _.partition(res, (result) => result.option === 'Account');
			//[0] = Block results
			//[1] = Transaction results
			const blocksAndTransactions = _.partition(accountsAndOthers[1], (result) => result.option === 'Block');
			
			const accountOutput = formatOutputResults(accountsAndOthers[0], 'Accounts');
			const blockOutput = formatOutputResults(blocksAndTransactions[0], 'Blocks');
			const transactionOutput = formatOutputResults(blocksAndTransactions[1], 'Transactions');
			
			console.log(`${accountOutput}${(accountOutput.length > 0 && blockOutput.length > 0 ? '\n\n' : '')}${blockOutput}` +
						`${((blockOutput.length > 0 || accountOutput.length > 0) && transactionOutput.length > 0 ? '\n\n' : '')}${transactionOutput}`);
		} else {
			console.log((resIsArray ? res[0] : res).data.toString());
		}
	}).catch((err) => {
		if (typeof(err) === 'string') {
			console.log(err);
		} else {
			console.log(usage);
		}
	});
}

function formatOutputResults(results, outputTitle) {
	const resultStrings = _.map(results, (result) => result.data.toString());

	return resultStrings.length > 0 ? `${outputTitle}\n======================\n${resultStrings.join('\n\n')}` : '';
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
				if (noOptionsSpecified) {
					options.unknown =  argv[0];
				}
				
				const shortHandCommand = commandLineArgData.shortHandMap.hasOwnProperty(command) ? commandLineArgData.shortHandMap[command] : command;
				const handler = new OptionRequestHandler(shortHandCommand, options);
				
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