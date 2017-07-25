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
const AbiDecoder = require('ethereum-input-data-decoder');
const ApiClientBase = require('./api-client-base');
const _ = require('underscore');

function hex2ascii(hexx) {
    const hex = hexx.toString();
    let str = '';
    
	for (let i = 0; i < hex.length; i += 2) {
		let intCode = parseInt(hex.substr(i, 2), 16);
		
		if (intCode >= 32 && intCode <= 126) {
        	str += String.fromCharCode(intCode);
		}
	}
	
    return str.trim();
}

class EtherscanClient extends ApiClientBase {
	constructor() {
		super('https://api.etherscan.io/api?');
	}
	
	getAccount() {
		return Promise.reject('Operation not supported.');
	}
	
	getBlockByNumberOrHash() {
		return Promise.reject('Operation not supported.');
	}
	
	getTransaction(transactionHash) {
		let abi = undefined;
		let transaction = undefined;
		
		return this.executeRequest(`module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}`, 'Transaction').then((res) => {
			if (res.hasOwnProperty('result')) {
				transaction = res.result;
				transaction.finalRecipient = transaction.to;		//The 'to' field may be a contract address (and therefore needed later) so use 'finalRecipient' as the actual recipient
				transaction.valueSymbol = '';
				transaction.valueDivisor = 1000000000000000000;		//Amount of wei in 1 ether
				
				return this.executeRequest(`module=contract&action=getabi&address=${transaction.to}`, 'Transaction');
			}
			
			return Promise.reject('Transaction not found.');
		}).then((res) => {
			if (res.status === '1' && res.message === 'OK') {
				abi = JSON.parse(res.result);
				//v0.0.2 of ethereum-input-data-decoder on NPM doesn't account for a null 'inputs' field. The fix is in
				// on GitHub so this workaround is temporary until that is published.
				_.each(abi, (obj) => obj.inputs = obj.inputs ? obj.inputs : []);

				const abiDecoder = new AbiDecoder(abi);
				const decodedInput = abiDecoder.decodeData(transaction.input);
				const addressIndex = decodedInput.types.indexOf('address');
				const uint256Index = decodedInput.types.indexOf('uint256');
				
				if (decodedInput.name === 'transfer' && addressIndex !== -1 && uint256Index !== -1) {
					transaction.finalRecipient = '0x' + decodedInput.inputs[addressIndex].toString(16);
					transaction.value = decodedInput.inputs[uint256Index].toString(16);
					
					const decimals = _.find(abi, (func) => func.name === 'decimals');
					if (decimals !== undefined) {
						//0x313ce567 is the hash of the 'decimals' field for ERC-20 tokens. It
						// was derived from require('ethereumjs-abi').methodID('decimals', [])
						return this.executeRequest(`module=proxy&action=eth_call&to=${transaction.to}&data=0x313ce567&tag=latest`, 'Transaction');
					}
				}
			}
			
			return transaction;
		}).then((res) => {
			if (res.hasOwnProperty('result') && res.result !== '0x') {
				transaction.valueDivisor = Math.pow(10, parseInt(res.result, 16));
				
				const symbol = _.find(abi, (func) => func.name === 'symbol');
				if (symbol !== undefined) {
					//0x95d89b41 is the hash of the 'symbol' field for ERC-20 tokens. It
					// was derived from require('ethereumjs-abi').methodID('symbol', [])
					return this.executeRequest(`module=proxy&action=eth_call&to=${transaction.to}&data=0x95d89b41&tag=latest`, 'Transaction');
				}
			}
			
			return transaction;
		}).then((res) => {
			if (res.hasOwnProperty('result') && res.result !== '0x') {
				transaction.valueSymbol = hex2ascii(res.result);
			}
			
			return transaction;
		});
	}
}

module.exports = new EtherscanClient();