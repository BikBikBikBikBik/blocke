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
const proxyquire = require('proxyquire');
const random = require('../random-generator');

class MockSpinnerBase {
	constructor() {
		this.startWasCalled = false;
		this.title = undefined;
	}
	
	setSpinnerTitle(title) {
		this.title = title;
	}
	
	start() {
		this.startWasCalled = true;
	}
}

describe('lib/extended-spinner', function() {
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.spinner = proxyquire('../../lib/extended-spinner', {'cli-spinner': {Spinner: MockSpinnerBase}});
	});
	
	/*
	 *
	 *  startSpinner
	 *
	 */
	describe('startSpinner', function() {
		it('should set the title and start the spinner', function() {
			const instance = new this.spinner();
			const title = random.generateRandomHashString(16);
			instance.startSpinner(title);
			
			assert.equal(instance.title, title);
			assert.isTrue(instance.startWasCalled);
		});
	});
});