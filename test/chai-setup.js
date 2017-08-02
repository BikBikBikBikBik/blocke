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
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

if (!chai.assert.hasOwnProperty('startsWith')) {
	chai.assert.startsWith = function(value, prefix) {
		if (typeof(value) !== 'string') {
			throw new chai.AssertionError('Value must be a string.');
		}
		if (typeof(prefix) !== 'string') {
			throw new chai.AssertionError('Prefix must be a string.');
		}
		if (!value.startsWith(prefix)) {
			throw new chai.AssertionError(`String '${value}' does not start with '${prefix}'.`)
		}
	};
}

module.exports = chai.assert;