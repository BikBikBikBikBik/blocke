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
const resources = require('./resources');

class ApiClientBase {
	constructor(apiBaseAddress) {
		this._apiBaseAddress = apiBaseAddress;
	}
	
	executeRequest(uriSuffix, objectName) {
		const requestOptions = {
			json: true,
			timeout: 15 * 1000,
			uri: `${this._apiBaseAddress}${uriSuffix}`
		};

		return request(requestOptions).catch((err) => {
			if ([ 400, 404 ].includes(err.statusCode)) {
				return Promise.reject(resources.generateObjectNotFoundMessage(objectName));
			}
			if (err.statusCode === 429) {
				return Promise.reject(resources.tooManyRequestsMessage);
			}
			if (err.statusCode === undefined && typeof(err.error) === 'object' && [ 'ESOCKETTIMEDOUT', 'ETIMEDOUT' ].includes(err.error.code)) {
				return Promise.reject(err.error.connect === true ? resources.connectionTimeoutMessage : resources.readTimeoutMessage);
			}

			return Promise.reject(resources.generateGenericObjectErrorMessage(objectName));
		});
	}
}

module.exports = ApiClientBase;