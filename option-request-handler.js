const spinner = new (require('./extended-spinner'))();
const apiFactory = require('./api/factory');
const typeMapperFactory = require('./type-mapper/factory');

function handleIndividualRequest(apiRequest, resultMapper, waitMessage) {
	const useSpinner = typeof(waitMessage) === 'string';
	if (useSpinner) {
		spinner.startSpinner(waitMessage);
	}
	
	return apiRequest().then(function(res) {
		if (useSpinner) {
			spinner.stop(true);
		}

		return resultMapper(res);
	}).catch(function(error) {
		if (useSpinner) {
			spinner.stop(true);
		}

		return Promise.reject(error);
	});
}

class OptionRequestHandler {
	constructor(api, options) {
		this._api = apiFactory.getApi(api);
		this._typeMapper = typeMapperFactory.getTypeMapper(api);
		this._options = options;
		
		if (this._api === undefined || this._typeMapper === undefined) {
			throw `Unsupported API: ${api}`;
		}
	}
	
	handleRequest() {
		if (typeof(this._options.account) === 'string') {
			return this.handleAccountRequest(this._options.account.trim());
		}
		if (typeof(this._options.block) === 'string') {
			return this.handleBlockRequest(this._options.block.trim());
		}
		if (typeof(this._options.transaction) === 'string') {
			return this.handleTransactionRequest(this._options.transaction.trim());
		}
		if (typeof(this._options.unknown) === 'string') {
			return this.handleUnknownRequest(this._options.unknown.trim());
		}
		
		return Promise.reject();
	}
	
	handleAccountRequest(account, showSpinner = true) {
		return handleIndividualRequest(this._api.getAccount.bind(this._api, account), this._typeMapper.mapAccount, showSpinner ? 'Retrieving account...' : null);
	}
	
	handleBlockRequest(block, showSpinner = true) {
		return handleIndividualRequest(this._api.getBlockByNumberOrHash.bind(this._api, block), this._typeMapper.mapBlock, showSpinner ? 'Retrieving block...' : null);
	}
	
	handleTransactionRequest(transaction, showSpinner = true) {
		return handleIndividualRequest(this._api.getTransaction.bind(this._api, transaction), this._typeMapper.mapTransaction, showSpinner ? 'Retrieving transaction...' : null);
	}
	
	handleUnknownRequest(unknown) {
		const self = this;
		spinner.startSpinner('Searching...');
		
		return self.handleTransactionRequest(unknown, false).catch(function(err) {
			return self.handleBlockRequest(unknown, false);
		}).catch(function(err) {
			return self.handleAccountRequest(unknown, false);
		}).catch(function(err) {
			spinner.stop(true);

			return Promise.reject(`Unknown value: ${self._options.unknown}`);
		}).then(function(res) {
			spinner.stop(true);

			return res;
		});
	}
}

module.exports = OptionRequestHandler;