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
const ApiClientBase = require('./api-client-base');
const resources = require('./resources');

function handleResponseErrors(res, objectName) {
	if (res.data.length === 1) {
		return res.data[0];
	}
	
	return Promise.reject(resources.generateObjectNotFoundMessage(objectName));
}

class EtherchainClient extends ApiClientBase {
	constructor() {
		super('https://etherchain.org/api/');
	}
	
	getAccount() {
		return Promise.reject(resources.operationNotSupportedMessage);
	}
	
	getBlockByNumberOrHash(blockId) {
		return this.executeRequest(`block/${blockId}`, 'Block').then((res) => handleResponseErrors(res, 'Block'))
		.then((res) => {
			//There is currently a bug in the API that returns block #0 for many invalid block hashes/numbers
			const formattedBlock = blockId.trim().toLowerCase();
			if (res.hash.toLowerCase() !== formattedBlock && res.number.toString() !== formattedBlock) {
				return Promise.reject(resources.blockNotFoundMessage);
			}
			
			return res;
		});
	}
	
	getTransaction() {
		return Promise.reject(resources.operationNotSupportedMessage);
	}
}

module.exports = new EtherchainClient();