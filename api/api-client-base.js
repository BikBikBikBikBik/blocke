const request = require('request-promise');

let _apiBaseAddress = undefined;

class ApiClientBase {
	constructor(apiBaseAddress) {
		_apiBaseAddress = apiBaseAddress;
	}
	
	executeRequest(uriSuffix, objectName, errorHandler) {
		let requestOptions = {
			json: true,
			uri: `${_apiBaseAddress}${uriSuffix}`
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
			
			return Promise.reject(`An error occurred while attempting to retrieve the ${objectName}.`);
		});
	}
}

module.exports = ApiClientBase;