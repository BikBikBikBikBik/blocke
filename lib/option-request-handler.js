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
const Spinner = require('./extended-spinner');
const apiFactory = require('./api/factory');
const typeMapperFactory = require('./type-mapper/factory');
const _ = require('underscore');

function handleIndividualRequest(apiRequest, resultMapper, waitMessage, resolveOnError) {
	const useSpinner = typeof(waitMessage) === 'string';
	const spinner = new Spinner();
	if (useSpinner) {
		spinner.startSpinner(waitMessage);
	}
	
	return apiRequest().then((res) => {
		if (useSpinner) { 
			spinner.stop(true);
		}

		return resultMapper(res);
	}).catch((err) => {
		if (useSpinner) {
			spinner.stop(true);
		}
		
		return resolveOnError === true ? Promise.resolve({toString: () => err}) : Promise.reject(err);
	});
}

class OptionRequestHandler {
	constructor(api, options) {
		this._api = apiFactory.getApi(api);
		this._typeMapper = typeMapperFactory.getTypeMapper(api);
		this._options = options;
		
		if (this._api === undefined || this._typeMapper === undefined) {
			throw new Error(`Unsupported API: ${api}`);
		}
	}
	
	handleRequest() {
		if (typeof(this._options.unknown) === 'string') {
			return this.handleUnknownRequest(this._options.unknown.trim());
		} else {
			let allOptionsPromises = [];

			if (Array.isArray(this._options.account)) {
				const optionsPromises = _.map(this._options.account, (account) => this.handleAccountRequest(account.trim()));
				
				allOptionsPromises = allOptionsPromises.concat(optionsPromises);
			}
			if (Array.isArray(this._options.block)) {
				const optionsPromises = _.map(this._options.block, (block) => this.handleBlockRequest(block.trim()));
				
				allOptionsPromises = allOptionsPromises.concat(optionsPromises);
			}
			if (Array.isArray(this._options.transaction)) {
				const optionsPromises = _.map(this._options.transaction, (transaction) => this.handleTransactionRequest(transaction.trim()));
				
				allOptionsPromises = allOptionsPromises.concat(optionsPromises);
			}
			
			return Promise.all(allOptionsPromises);
		}
		
		return Promise.reject();
	}
	
	handleAccountRequest(accountAddress, showSpinner = true, resolveOnError = true) {
		return handleIndividualRequest(this._api.getAccount.bind(this._api, accountAddress), this._typeMapper.mapAccount, showSpinner ? 'Retrieving account...' : null, resolveOnError)
			.then((res) => ({ option: 'Account', data: res }));
	}
	
	handleBlockRequest(blockId, showSpinner = true, resolveOnError = true) {
		return handleIndividualRequest(this._api.getBlockByNumberOrHash.bind(this._api, blockId), this._typeMapper.mapBlock, showSpinner ? 'Retrieving block...' : null, resolveOnError)
			.then((res) => ({ option: 'Block', data: res }));
	}
	
	handleTransactionRequest(transactionHash, showSpinner = true, resolveOnError = true) {
		return handleIndividualRequest(this._api.getTransaction.bind(this._api, transactionHash), this._typeMapper.mapTransaction, showSpinner ? 'Retrieving transaction...' : null, resolveOnError)
			.then((res) => ({ option: 'Transaction', data: res }));
	}
	
	handleUnknownRequest(unknown) {
		const spinner = new Spinner();
		spinner.startSpinner('Searching...');
		
		return this.handleTransactionRequest(unknown, false, false).catch((err) => this.handleBlockRequest(unknown, false, false))
		.catch((err) => this.handleAccountRequest(unknown, false, false))
		.catch((err) => {
			spinner.stop(true);

			return Promise.reject(`Unknown value: ${unknown}`);
		}).then((res) => {
			spinner.stop(true);

			return res;
		});
	}
}

module.exports = OptionRequestHandler;