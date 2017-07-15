const ethApi = require('./api/etherchain');
const SoChain = require('./api/sochain');
const spinner = new (require('./extended-spinner'))();
const xmrApi = require('./api/moneroblocks');

const _optionRequestHandlerApiMap = {
	btc: new SoChain('btc'),
	dash: new SoChain('dash'),
	doge: new SoChain('doge'),
	eth: ethApi,
	ltc: new SoChain('ltc'),
	xmr: xmrApi
};

class OptionRequestHandler {
	constructor(api, options) {
		let formattedApi = api.trim().toLowerCase();
		if (!_optionRequestHandlerApiMap.hasOwnProperty(formattedApi)) {
			throw `Unsupported API: ${api}`;
		} else {
			this._api = _optionRequestHandlerApiMap[formattedApi];
		}
		
		this._options = options;
	}
	
	handleRequest() {
		if (typeof(this._options.account) === 'string') {
			return this.handleAccountRequest(this._options.account.trim());
		} else if (typeof(this._options.block) === 'string') {
			return this.handleBlockRequest(this._options.block.trim());
		} else if (typeof(this._options.transaction) === 'string') {
			return this.handleTransactionRequest(this._options.transaction.trim());
		} else {
			return Promise.reject();
		}
	}
	
	handleAccountRequest(account) {
		spinner.startSpinner('Retrieving account...');
		
		return this._api.getAccount(account).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleBlockRequest(block) {
		spinner.startSpinner('Retrieving block...');

		return this._api.getBlockByNumberOrHash(block).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleTransactionRequest(transaction) {
		spinner.startSpinner('Retrieving transaction...');

		return this._api.getTransaction(transaction).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
}

module.exports = OptionRequestHandler;