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

function executeRequest(uriSuffix, objectName) {
	let requestOptions = {
		json: true,
		uri: `https://etherchain.org/api/${uriSuffix}`
	};
		
	return request(requestOptions).catch(function(err) {
		return Promise.reject(`An error occurred while attempting to retrieve the ${objectName.toLowerCase()}.`);
	}).then(function(res) {
		if (res.data.length === 1) {
			return res.data[0];
		}
		
		return Promise.reject(`${objectName} not found.`);
	});
}

class EtherchainClient {
	getAccount(accountAddress) {
		const formattedAccount = accountAddress.startsWith('0x') ? accountAddress : '0x' + accountAddress;
		
		return executeRequest(`account/${formattedAccount}`, 'Account');
	}
	
	getBlockByNumberOrHash(blockId) {
		return executeRequest(`block/${blockId}`, 'Block').then(function(res) {
			//There is currently a bug in the API that returns block #0 for many invalid block hashes/numbers
			const formattedBlock = blockId.trim().toLowerCase();
			if (res.hash.toLowerCase() !== formattedBlock && res.number.toString() !== formattedBlock) {
				return Promise.reject('Block not found.');
			}
			
			return res;
		});
	}
	
	getTransaction(transaction) {
		return executeRequest(`tx/${transaction}`, 'Transaction');
	}
}

module.exports = new EtherchainClient();