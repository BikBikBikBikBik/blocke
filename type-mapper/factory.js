const chainRadarMapper = require('./chainradar');
const ethMapper = require('./etherchain');
const soChainMapper = require('./sochain');

function getTypeMapper(symbol) {
	if (typeof(symbol) === 'string') {
		const formattedSymbol = symbol.trim().toLowerCase();
		const supportedTypeMapperMap = {
			btc: soChainMapper,
			dash: soChainMapper,
			doge: soChainMapper,
			eth: ethMapper,
			ltc: soChainMapper,
			xmr: chainRadarMapper
		};
		
		if (supportedTypeMapperMap.hasOwnProperty(formattedSymbol)) {
			return supportedTypeMapperMap[formattedSymbol];
		}
	}
	
	return undefined;
}

exports.getTypeMapper = getTypeMapper;