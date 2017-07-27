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
const commandLineDataSource = require('./command-line-arg-data-source');
const dataGenerator = require('./command-line-arg-data-usage-generator');
const _ = require('underscore');

/*
 *
 *  Currencies
 *
 */
const currencies = _.mapObject(commandLineDataSource.currencies, (currency, key) => {
	currency.command = key;
	
	const usageInfo = dataGenerator.generateCurrency(currency);
	usageInfo.currencyName = currency.currencyName;
	
	return usageInfo;
});

/*
 *
 *  Help
 *
 */
const commandListHeader = _.find(commandLineDataSource.help.usage, (usage) => usage.header === 'Command List');
commandListHeader.content = _.map(currencies, (data, key) => ({ name: key, summary: data.usage[0].content }));

/*
 *
 *  Null (no command specified)
 *
 */
const optionsHeader = _.find(commandLineDataSource.null.usage, (usage) => usage.header === 'Options');
optionsHeader.optionList = commandLineDataSource.null.definitions;

/*
 *
 *  Module exports
 *
 */
const moduleExports = _.clone(currencies);
moduleExports.help = commandLineDataSource.help;
moduleExports.null = commandLineDataSource.null;
moduleExports.shortHandMap = {};

_.each(currencies, function(data, key) {
	const formattedName = data.currencyName.toLowerCase();
	
	if (!moduleExports.hasOwnProperty(formattedName)) {
		moduleExports[formattedName] = data;
		moduleExports.shortHandMap[formattedName] = key;
	}
});

module.exports = moduleExports;