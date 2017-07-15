const ChainRadarApi = require('./api/chainradar');
const chainRadarMapper = require('./type-mapper/chainradar');
const ethApi = require('./api/etherchain');
const ethMapper = require('./type-mapper/etherchain');
const SoChainApi = require('./api/sochain');
const soChainMapper = require('./type-mapper/sochain');
const spinner = new (require('./extended-spinner'))();

const _optionRequestHandlerApiMap = {
	btc: new SoChainApi('btc'),
	dash: new SoChainApi('dash'),
	doge: new SoChainApi('doge'),
	eth: ethApi,
	ltc: new SoChainApi('ltc'),
	xmr: new ChainRadarApi('xmr')
};
const _optionRequestHandlerTypeMapperMap = {
	btc: soChainMapper,
	dash: soChainMapper,
	doge: soChainMapper,
	eth: ethMapper,
	ltc: soChainMapper,
	xmr: chainRadarMapper
};

class OptionRequestHandler {
	constructor(api, options) {
		let formattedApi = api.trim().toLowerCase();
		if (!_optionRequestHandlerApiMap.hasOwnProperty(formattedApi) || !_optionRequestHandlerTypeMapperMap.hasOwnProperty(formattedApi)) {
			throw `Unsupported API: ${api}`;
		}
		
		this._api = _optionRequestHandlerApiMap[formattedApi];
		this._typeMapper = _optionRequestHandlerTypeMapperMap[formattedApi];
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
		
		let self = this;
		return this._api.getAccount(account).then(function(res) {
			spinner.stop(true);
			
			return self._typeMapper.mapAccount(res);
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleBlockRequest(block) {
		spinner.startSpinner('Retrieving block...');

		let self = this;
		return this._api.getBlockByNumberOrHash(block).then(function(res) {
			spinner.stop(true);
			
			return self._typeMapper.mapBlock(res);
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
	
	handleTransactionRequest(transaction) {
		spinner.startSpinner('Retrieving transaction...');

		let self = this;
		return this._api.getTransaction(transaction).then(function(res) {
			spinner.stop(true);
			
			return self._typeMapper.mapTransaction(res);
		}).catch(function(error) {
			spinner.stop(true);
			
			return Promise.reject(error);
		});
	}
}

module.exports = OptionRequestHandler;