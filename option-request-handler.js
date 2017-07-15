const ethApi = require('./api/etherchain');
const SoChain = require('./api/sochain');
const spinner = new (require('./extended-spinner'))();
const xmrApi = require('./api/moneroblocks');

let _api = undefined;
const _apiMap = {
	btc: new SoChain('btc'),
	eth: ethApi,
	ltc: new SoChain('ltc'),
	xmr: xmrApi
};
let _options = {};

class OptionRequestHandler {
	constructor(api, options) {
		let formattedApi = api.trim().toLowerCase();
		if (!_apiMap.hasOwnProperty(formattedApi)) {
			throw `Unsupported API: ${api}`;
		} else {
			_api = _apiMap[formattedApi];
		}
		
		_options = options;
	}
	
	handleRequest() {
		if (typeof(_options.account) === 'string') {
			return this.handleAccountRequest(_options.account.trim());
		} else if (typeof(_options.block) === 'string') {
			return this.handleBlockRequest(_options.block.trim());
		} else if (typeof(_options.transaction) === 'string') {
			return this.handleTransactionRequest(_options.transaction.trim());
		} else {
			return Promise.reject();
		}
	}
	
	handleAccountRequest(account) {
		spinner.startSpinner('Retrieving account...');
		
		return _api.getAccount(account).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleBlockRequest(block) {
		spinner.startSpinner('Retrieving block...');

		return _api.getBlockByNumberOrHash(block).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleTransactionRequest(transaction) {
		spinner.startSpinner('Retrieving transaction...');

		return _api.getTransaction(transaction).then(function(res) {
			spinner.stop(true);
			
			return res;
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
}

module.exports = OptionRequestHandler;