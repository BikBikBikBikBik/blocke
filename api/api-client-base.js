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
const request = require('request-promise');

class ApiClientBase {
	constructor(apiBaseAddress) {
		this._apiBaseAddress = apiBaseAddress;
	}
	
	executeRequest(uriSuffix, objectName, errorHandler) {
		const requestOptions = {
			json: true,
			uri: `${this._apiBaseAddress}${uriSuffix}`
		};

		return request(requestOptions).then(function(res) {
			return res;
		}).catch(function(err) {
			if (typeof(errorHandler) === 'function') {
				return errorHandler(err, objectName);
			}
			if (err.statusCode === 400 || err.statusCode === 404) {
				return Promise.reject(`${objectName} not found.`);
			}
			
			return Promise.reject(`An error occurred while attempting to retrieve the ${objectName.toLowerCase()}.`);
		});
	}
}

module.exports = ApiClientBase;