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
const seedrandom = require('seedrandom');

function generateRandomHashString(length, seed) {
	let hash = '';
	let dynamicSeed = seed;
	
	for (let i = 0; i < length; i++) {
		switch (generateRandomIntInclusive(0, 2, dynamicSeed)) {
			case 0:
				hash += String.fromCharCode(generateRandomIntInclusive(65, 90, dynamicSeed));
			break;

			case 1:
				hash += String.fromCharCode(generateRandomIntInclusive(97, 122, dynamicSeed));
			break;

			case 2:
				hash += String.fromCharCode(generateRandomIntInclusive(48, 57, dynamicSeed));
			break;
		}
		
		if (dynamicSeed !== undefined) {
			dynamicSeed += 1;
		}
	}

	return hash;
}

function generateRandomIntInclusive(min, max, seed) {
	const date = new Date();
	const random = seed !== undefined ? seedrandom(seed + date.getUTCDate() + date.getUTCMonth() + date.getUTCFullYear()) : seedrandom();
	
	min = Math.ceil(min);
	max = Math.ceil(max);

	return Math.floor(random() * (max - min + 1)) + min;
}

exports.generateRandomHashString = generateRandomHashString;
exports.generateRandomIntInclusive = generateRandomIntInclusive;