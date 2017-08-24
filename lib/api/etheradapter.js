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
const ethplorerClient = require('./ethplorer');

class EtherAdapter {
	getAccount(accountAddress) {
		return ethplorerClient.getAccount(accountAddress);
	}
	
	getBlockByNumberOrHash(blockId) {
		return etherchainClient.getBlockByNumberOrHash(blockId);
	}
	
	getNetworkInfo() {
		return etherchainClient.getNetworkInfo();
	}
	
	getTransaction(transactionHash) {
		return ethplorerClient.getTransaction(transactionHash).then((res) => this.updateTransactionBlockHash(res));
	}
	
	updateTransactionBlockHash(transaction) {
		const blockId = `${transaction.blockNumber}`;
		
		return this.getBlockByNumberOrHash(blockId).then((res) => {
			transaction.blockHash = res.hash;
			
			return transaction;
		}).catch(() => {
			transaction.blockHash = blockId;
			
			return transaction;
		});
	}
}

module.exports = new EtherAdapter();