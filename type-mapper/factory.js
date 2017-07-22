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
const chainRadarMapper = require('./chainradar');
const ethMapper = require('./etherchain');
const scMapper = require('./siatech');
const soChainMapper = require('./sochain');
const zChainMapper = require('./zchain');

function getTypeMapper(symbol) {
	if (typeof(symbol) === 'string') {
		const formattedSymbol = symbol.trim().toLowerCase();
		const supportedTypeMapperMap = {
			aeon: chainRadarMapper,
			btc: soChainMapper,
			dash: soChainMapper,
			doge: soChainMapper,
			eth: ethMapper,
			ltc: soChainMapper,
			sc: scMapper,
			xmr: chainRadarMapper,
			zec: zChainMapper
		};
		
		if (supportedTypeMapperMap.hasOwnProperty(formattedSymbol)) {
			return supportedTypeMapperMap[formattedSymbol];
		}
	}
	
	return undefined;
}

exports.getTypeMapper = getTypeMapper;