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
const { Block, Transaction } = require('./models');
const _ = require('underscore');

const piconeroPerMonero = 1000000000000;

class ChainRadarTypeMapper {
	mapAccount(account) {
		throw new Error('Operation not supported.');
	}
	
	mapBlock(block) {
		return new Block(block.blockHeader.difficulty, block.blockHeader.hash, block.blockHeader.height, new Date(block.blockHeader.timestamp * 1000), block.transactions.length);
	}
	
	mapTransaction(transaction) {
		return new Transaction(transaction.header.totalInputsAmount / piconeroPerMonero, transaction.header.blockHash, transaction.header.hash, _.map(transaction.outputs, (output) => ({ address: '???', amount: output.amount / piconeroPerMonero })),
			_.map(transaction.inputs, (input) => ({ address: '???', amount: input.amount / piconeroPerMonero })), new Date(transaction.header.timestamp * 1000));
	}
}

module.exports = new ChainRadarTypeMapper();