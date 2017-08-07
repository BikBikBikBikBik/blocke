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
const commandLineDataSource = require('../../lib/command-line-arg-data-source');
const commandLineDataUsage = require('../../lib/command-line-arg-data-usage');
const proxyquire = require('proxyquire');
const _ = require('underscore');

describe('lib/command-line-arg-data-usage', function() {
	/*
	 *
	 *  module exports
	 *
	 */
	describe('module exports', function() {
		it('should have all available commands', function() {
			assert.property(commandLineDataUsage, 'help');
			assert.property(commandLineDataUsage, 'null');
			assert.property(commandLineDataUsage, 'shortHandMap');
			
			_.each(commandLineDataSource.currencies, (data, key) => {
				assert.property(commandLineDataUsage, key);
				assert.property(commandLineDataUsage, data.currencyName.replace(' ', '').toLowerCase());
			});
		});
		
		it(`should populate 'help' command list`, function() {
			const commandListHeader = _.find(commandLineDataUsage.help.usage, (usage) => usage.header === 'Command List');
			
			assert.exists(commandListHeader);
			assert.isArray(commandListHeader.content);
			assert.lengthOf(commandListHeader.content, Object.keys(commandLineDataSource.currencies).length);
		});
		
		it(`should populate 'null' option list`, function() {
			const optionsHeader = _.find(commandLineDataUsage.null.usage, (usage) => usage.header === 'Options');
			
			assert.exists(optionsHeader);
			assert.isArray(optionsHeader.optionList);
			assert.lengthOf(optionsHeader.optionList, commandLineDataSource.null.definitions.length);
		});
	});
});