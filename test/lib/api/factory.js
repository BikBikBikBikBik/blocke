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
const apiFactory = require('../../../lib/api/factory');
const _ = require('underscore');

describe('lib/api/factory', function() {
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.apiFactory = require('../../../lib/api/factory');
	});
	
	/*
	 *
	 *  getApi
	 *
	 */
	describe('getApi', function() {
		const networks = _.map(commandLineDataSource.currencies, (currency, key) => key);
		const expectedMethods = [ 'getAccount', 'getBlockByNumberOrHash', 'getTransaction' ];
		
		networks.forEach(function(network) {
			it(`should return a valid api for '${network}'`, function() {
				const api = this.apiFactory.getApi(network);
				
				assert.exists(api);
				
				const apiProperties = Object.getOwnPropertyNames(Object.getPrototypeOf(api));
				
				expectedMethods.forEach((method) => { assert.isTrue(apiProperties.includes(method), `API method not found: ${method}\n`) });
			});
		});
		
		it('should return undefined for invalid input', function() {
			const api = this.apiFactory.getApi('asdfasdfsadf');
			
			assert.notExists(api);
		});
		
		it('should return undefined for unsupported networks', function() {
			const api = this.apiFactory.getApi({someOtherProp: 'someOtherVal'});
			
			assert.notExists(api);
		});
	});
});