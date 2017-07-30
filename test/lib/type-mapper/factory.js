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
const assert = require('../../chai-setup');
const commandLineDataSource = require('../../../lib/command-line-arg-data-source');
const typeMapperFactory = require('../../../lib/type-mapper/factory');
const _ = require('underscore');

describe('lib/type-mapper/factory', function() {
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.typeMapperFactory = require('../../../lib/type-mapper/factory');
	});
	
	/*
	 *
	 *  getTypeMapper
	 *
	 */
	describe('getTypeMapper', function() {
		const networks = _.map(commandLineDataSource.currencies, (currency, key) => key);
		const expectedMethods = [ 'mapAccount', 'mapBlock', 'mapTransaction' ];
		
		networks.forEach(function(network) {
			it(`should return a valid type mapper for '${network}'`, function() {
				const typeMapper = this.typeMapperFactory.getTypeMapper(network);
				
				assert.exists(typeMapper);
				
				const typeMapperProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(typeMapper));
				
				expectedMethods.forEach((method) => { assert.isTrue(typeMapperProperties.includes(method), `TypeMapper method not found: ${method}\n`) });
			});
		});
		
		it('should return undefined for invalid input', function() {
			const typeMapper = this.typeMapperFactory.getTypeMapper('asjkldfhlaksjdfsdfkjslhd');
			
			assert.notExists(typeMapper);
		});
		
		it('should return undefined for unsupported networks', function() {
			const typeMapper = this.typeMapperFactory.getTypeMapper({someProp: 'someVal'});
			
			assert.notExists(typeMapper);
		});
	});
});