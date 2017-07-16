const ChainRadarApi = require('./chainradar');
const ethApi = require('./etherchain');
const SoChainApi = require('./sochain');

function getApi(symbol) {
	if (typeof(symbol) === 'string') {
		const formattedSymbol = symbol.trim().toLowerCase();
		const supportedAiMap = {
			btc: new SoChainApi('btc'),
			dash: new SoChainApi('dash'),
			doge: new SoChainApi('doge'),
			eth: ethApi,
			ltc: new SoChainApi('ltc'),
			xmr: new ChainRadarApi('xmr')
		};

		if (supportedAiMap.hasOwnProperty(formattedSymbol)) {
			return supportedAiMap[formattedSymbol];
		}
	}
	
	return undefined;
}

exports.getApi = getApi;