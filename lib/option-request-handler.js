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
const resources = require('./resources');
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
			throw new Error(resources.generateUnsupportedApiMessage(api));
		}
	}
	
	handleRequest() {
		if (typeof(this._options.unknown) === 'string') {
			return this.handleUnknownRequest(this._options.unknown.trim());
		}
		
		const allOptionsPromises = _.union(this.handleAccountRequests(this._options.account), this.handleBlockRequests(this._options.block), this.handleTransactionRequests(this._options.transaction), this._options.network === true ? this.handleNetworkInfoRequest() : []);

		return Promise.all(allOptionsPromises);
	}
	
	handleAccountRequests(accountAddresses, showSpinner = true, resolveOnError = true) {
		return this.handleIndividualRequests(accountAddresses, this._api.getAccount, this._typeMapper.mapAccount, 'Account', showSpinner, resolveOnError);
	}
	
	handleBlockRequests(blockIds, showSpinner = true, resolveOnError = true) {
		return this.handleIndividualRequests(blockIds, this._api.getBlockByNumberOrHash, this._typeMapper.mapBlock, 'Block', showSpinner, resolveOnError);
	}
	
	handleIndividualRequests(inputs, apiFunction, mapperFunction, objectName, showSpinner = true, resolveOnError = true) {
		const inputsIsArray = Array.isArray(inputs);
		const inputArray = inputsIsArray ? inputs : (typeof(inputs) === 'string' ? [inputs] : []);
		
		const inputPromises = _.map(inputArray, (input) =>
			handleIndividualRequest(apiFunction.bind(this._api, input), mapperFunction, showSpinner ? `Retrieving ${objectName.toLowerCase()}...` : null, resolveOnError)
				.then((res) => ({ option: objectName, data: res }))
		);
		
		return inputPromises.length === 0 ? [] : ((inputPromises.length === 1 && !inputsIsArray) ? inputPromises[0] : inputPromises);
	}
	
	handleNetworkInfoRequest() {
		return this.handleIndividualRequests([''], this._api.getNetworkInfo, this._typeMapper.mapNetworkInfo, 'Network Info', true, true);
	}
	
	handleTransactionRequests(transactionHashes, showSpinner = true, resolveOnError = true) {
		return this.handleIndividualRequests(transactionHashes, this._api.getTransaction, this._typeMapper.mapTransaction, 'Transaction', showSpinner, resolveOnError);
	}
	
	handleUnknownRequest(unknown) {
		const spinner = new Spinner();
		spinner.startSpinner('Searching...');
		
		return this.handleTransactionRequests(unknown, false, false).catch(() => this.handleBlockRequests(unknown, false, false))
		.catch(() => this.handleAccountRequests(unknown, false, false))
		.catch(() => {
			spinner.stop(true);

			return Promise.reject(resources.generateUnknownValueMessage(unknown));
		}).then((res) => {
			spinner.stop(true);

			return res;
		});
	}
}

module.exports = OptionRequestHandler;