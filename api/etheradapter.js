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
const etherchainClient = require('./etherchain');
const etherscanClient = require('./etherscan');

class EtherAdapter {
	getAccount(accountAddress) {
		return etherchainClient.getAccount(accountAddress);
	}
	
	getBlockByNumberOrHash(blockId) {
		return etherchainClient.getBlockByNumberOrHash(blockId);
	}
	
	getTransaction(transactionHash) {
		let etherscanTransaction = undefined;
		
		return etherscanClient.getTransaction(transactionHash).then((res) => {
			etherscanTransaction = res;
			
			//Etherscan does not include the timestamp, so call Etherchain for that
			return etherchainClient.getTransaction(transactionHash);
		}).then((res) => {
			etherscanTransaction.time = res.time;
			
			return etherscanTransaction;
		});
	}
}

module.exports = new EtherAdapter();