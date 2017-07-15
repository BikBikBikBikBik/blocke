const request = require('request-promise');

class ApiClientBase {
	constructor(apiBaseAddress) {
		this._apiBaseAddress = apiBaseAddress;
	}
	
	executeRequest(uriSuffix, objectName, errorHandler) {
		let requestOptions = {
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