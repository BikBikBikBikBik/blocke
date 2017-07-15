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