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
const { Account, Block, Network, Transaction } = require('./models');
const resources = require('./resources');
const _ = require('underscore');

class SoChainTypeMapper {
	mapAccount(account) {
		return new Account(account.address, parseFloat(account.confirmed_balance), parseFloat(account.unconfirmed_balance));
	}
	
	mapBlock(block) {
		return new Block(parseFloat(block.mining_difficulty), block.blockhash, block.block_no, new Date(block.time * 1000), block.txs.length);
	}
	
	mapNetworkInfo(network) {
		return new Network(parseFloat(network.mining_difficulty), parseFloat(network.hashrate), network.blocks);
	}
	
	mapTransaction(transaction) {
		const coinbaseInput = _.find(transaction.inputs, (input) => input.address === 'coinbase');
		if (coinbaseInput !== undefined) {
			coinbaseInput.address = resources.coinbaseAddressValue;
		}
		const normalOutputs = _.filter(transaction.outputs, (output) => output.type !== 'nulldata');
		
		return new Transaction(_.reduce(transaction.inputs, (total, input) => total + parseFloat(input.value), 0),
			transaction.blockhash, transaction.txid, _.map(normalOutputs, (output) => ({ address: output.address, amount: parseFloat(output.value) })),
			_.map(transaction.inputs, (input) => ({ address: input.address, amount: parseFloat(input.value) })), new Date(transaction.time * 1000));
	}
}

module.exports = new SoChainTypeMapper();