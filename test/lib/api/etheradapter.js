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
const assert = require('../../chai-setup');
const proxyquire = require('proxyquire');
const random = require('../../random-generator');

describe('lib/api/etheradapter', function() {
	/*
	 *
	 *  Hooks
	 *
	 */
	beforeEach(function() {
		this.mockEtherchainClient = {};
		this.mockEthplorerClient = {};
		this.etherAdapter = proxyquire('../../../lib/api/etheradapter', { './etherchain': this.mockEtherchainClient, './ethplorer': this.mockEthplorerClient });
	});
	
	/*
	 *
	 *  getAccount
	 *
	 */
	describe('getAccount', function() {
		it('should return an account (Valid account address)', function(done) {
			this.mockEthplorerClient.getAccount = (accountAddress) => Promise.resolve({address: accountAddress})
			
			const address = random.generateRandomHashString(32);
			this.etherAdapter.getAccount(address).should.eventually.deep.equal({address: address}).and.notify(done);
		});
		
		it ('should not return an account (Rejected promise response)', function(done) {
			this.mockEthplorerClient.getAccount = (accountAddress) => Promise.reject(`Error: ${accountAddress}`)
			
			const address = random.generateRandomHashString(32);
			this.etherAdapter.getAccount(address).should.eventually.be.rejectedWith(`Error: ${address}`).and.notify(done);
		});
	});
	
	/*
	 *
	 *  getBlockByNumberOrHash
	 *
	 */
	describe('getBlockByNumberOrHash', function() {
		it('should return a block (Valid block id)', function(done) {
			this.mockEtherchainClient.getBlockByNumberOrHash = (blockId) => Promise.resolve({blockId: blockId})
			
			const blockId = random.generateRandomHashString(32);
			this.etherAdapter.getBlockByNumberOrHash(blockId).should.eventually.deep.equal({blockId: blockId}).and.notify(done);
		});
		
		it ('should not return a block (Rejected promise response)', function(done) {
			this.mockEtherchainClient.getBlockByNumberOrHash = (blockId) => Promise.reject(`Error: ${blockId}`)
			
			const blockId = random.generateRandomHashString(32);
			this.etherAdapter.getBlockByNumberOrHash(blockId).should.eventually.be.rejectedWith(`Error: ${blockId}`).and.notify(done);
		});
	});
	
	/*
	 *
	 *  getTransaction
	 *
	 */
	describe('getTransaction', function() {
		it('should return a transaction (Valid transaction hash)', function(done) {
			const expectedBlockHash = random.generateRandomHashString(32);
			const expectedBlockNumber = random.generateRandomIntInclusive(1, 5000000);
			this.mockEtherchainClient.getBlockByNumberOrHash = (blockId) => {
				if (blockId === `${expectedBlockNumber}`) {
					return Promise.resolve({ blockNumber: expectedBlockNumber, hash: expectedBlockHash });
				}
				
				return Promise.reject(`Unexpected block number: ${blockId}`);
			}
			this.mockEthplorerClient.getTransaction = (transactionHash) => Promise.resolve({blockNumber: expectedBlockNumber})
			
			const transactionHash = random.generateRandomHashString(32);
			this.etherAdapter.getTransaction(transactionHash).should.eventually.deep.equal({ blockNumber: expectedBlockNumber, blockHash: expectedBlockHash }).and.notify(done);
		});
		
		it ('should not return a transaction (Rejected promise response)', function(done) {
			this.mockEthplorerClient.getTransaction = (transactionHash) => Promise.reject(`Error: ${transactionHash}`)
			
			const transactionHash = random.generateRandomHashString(32);
			this.etherAdapter.getTransaction(transactionHash).should.eventually.be.rejectedWith(`Error: ${transactionHash}`).and.notify(done);
		});
	});
	
	/*
	 *
	 *  updateTransactionBlockHash
	 *
	 */
	describe('updateTransactionBlockHash', function() {
		it('should set the blockHash field (Valid block response)', function(done) {
			const expectedBlockHash = random.generateRandomHashString(32);
			const expectedBlockNumber = random.generateRandomIntInclusive(1, 5000000);
			this.mockEtherchainClient.getBlockByNumberOrHash = (blockId) => {
				if (blockId === `${expectedBlockNumber}`) {
					return Promise.resolve({ blockNumber: expectedBlockNumber, hash: expectedBlockHash });
				}
				
				return Promise.reject(`Unexpected block number: ${blockId}`);
			}
			
			this.etherAdapter.updateTransactionBlockHash({blockNumber: expectedBlockNumber}).should.eventually.deep.equal({ blockNumber: expectedBlockNumber, blockHash: expectedBlockHash }).and.notify(done);
		});
		
		it('should set the blockHash field to the blockNumber field (Rejected promise response)', function(done) {
			const expectedBlockNumber = random.generateRandomIntInclusive(1, 5000000);
			this.mockEtherchainClient.getBlockByNumberOrHash = (blockId) => Promise.reject(`Unexpected block number: ${blockId}`)
			
			this.etherAdapter.updateTransactionBlockHash({blockNumber: expectedBlockNumber}).should.eventually.deep.equal({ blockNumber: expectedBlockNumber, blockHash: `${expectedBlockNumber}` }).and.notify(done);
		});
	});
});