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
const ChainRadarApi = require('./chainradar');
const ethApi = require('./etheradapter');
const InsightApi = require('./insight');
const scApi = require('./siatech');
const SoChainApi = require('./sochain');
const vtcApi = require('./vtconline');
const wavesApi = require('./wavesexplorer');
const zChainApi = require('./zchain');

function getApi(symbol) {
	if (typeof(symbol) === 'string') {
		const formattedSymbol = symbol.trim().toLowerCase();
		const supportedAiMap = {
			aeon: new ChainRadarApi('aeon'),
			btc: new SoChainApi('btc'),
			dash: new SoChainApi('dash'),
			dcr: new InsightApi('dcr'),
			doge: new SoChainApi('doge'),
			eth: ethApi,
			kmd: new InsightApi('kmd'),
			ltc: new SoChainApi('ltc'),
			sc: scApi,
			vtc: vtcApi,
			waves: wavesApi,
			xmr: new ChainRadarApi('xmr'),
			zec: zChainApi
		};

		if (supportedAiMap.hasOwnProperty(formattedSymbol)) {
			return supportedAiMap[formattedSymbol];
		}
	}
	
	return undefined;
}

exports.getApi = getApi;