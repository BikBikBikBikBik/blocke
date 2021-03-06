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
const _ = require('underscore');

class EtherAdapterTypeMapper {
	mapAccount(account) {
		const tokens = _.map(account.hasOwnProperty('tokens') ? account.tokens : [], (token) => ({
			balance: token.balance / Math.pow(10, parseInt(token.tokenInfo.decimals, 10)),
			symbol: token.tokenInfo.symbol
		}));
		
		return new Account(account.address, account.ETH.balance, 0, tokens);
	}
	
	mapBlock(block) {
		return new Block(block.difficulty, block.hash, block.number, new Date(block.time), block.tx_count);
	}
	
	mapNetworkInfo(network) {
		return new Network(network.stats.difficulty, network.stats.hashRate, network.blockCount.number, new Date(Date.parse(network.blockCount.time)));
	}
	
	mapTransaction(transaction) {
		const amount = transaction.value / transaction.valueDivisor;
		const amountString = `${amount}${transaction.valueSymbol.length > 0 ? ' ' : ''}${transaction.valueSymbol}`;
		
		return new Transaction(amountString, transaction.blockHash, transaction.hash, { address: transaction.to, amount: amountString }, { address: transaction.from, amount: amountString }, new Date(transaction.timestamp * 1000));
	}
}

module.exports = new EtherAdapterTypeMapper();