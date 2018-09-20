const commandLineArgData = require('../lib/command-line-arg-data-usage');
const commandLineArgs = require('command-line-args');
const commandLineCommands = require('command-line-commands');
const commandLineUsage = require('command-line-usage');
const OptionRequestHandler = require('../lib/option-request-handler');
const version = require('../package.json').version;
const _ = require('underscore');

module.exports = {
    executeHandler: function (coin, options, callback) {

        var command = coin;
        shortHandCommand = command;

        const handler = new OptionRequestHandler(shortHandCommand, options);
        const usage = commandLineUsage(commandLineArgData[command].usage);

        return executeHandler(handler, usage, callback);
    }
};

function executeHandler(handler, usage, callback) {

    handler.handleRequest().then((res) => {

        const results = Array.isArray(res) ? res : [res];

        callback(convertObject(res));

    }).catch((err) => {
            if (typeof(err) === 'string') {
            console.log(err);
        } else {
            console.log(usage);
        }
    });
}

function convertObject(res) {
    var blockApi = new Object();

    for (var i = 0; i < res.length; i++) {

        switch (res[i].option) {
            case 'Account':
                blockApi = account(blockApi, res[i].data);
                break;
            case 'Block':
                blockApi = block(blockApi, res[i].data);
                break;
            case 'Transaction':
                blockApi = transaction(blockApi, res[i].data);
            case 'Network Info':
                blockApi = network(blockApi, res[i].data);
        }
    }
    return blockApi;
}

function account(blockAccount, data) {
    var account = new Object();
    account.address = data._address;
    account.balance = data._confirmedBalance;
    account.tokenBalances = data._tokenBalances;
    account.unconfirmedBalance = data._unconfirmedBalance;
    blockAccount.account = account;

    return blockAccount;
}

function block(blockApi, data) {
    var block = new Object();

    block.difficulty = data._difficulty;
    block.hash = data._hash;
    block.number = data._number;
    block.time = data._time;
    block.transactionCount = data._transactionCount;
    blockApi.block = block;

    return blockApi;
}

function transaction(blockTransaction, data) {
    var transaction = new Object();

    transaction.amountSent = data._amountSent;
    transaction.blockHash = data._blockHash;
    transaction.hash = data._hash;
    transaction.recipients = data._recipients;
    transaction.senders = data._senders;
    transaction.time = data._time;
    blockTransaction.transaction = transaction;

    return blockTransaction;
}

function network(blockNetwork, data) {
    var network = new Object();
    network.difficulty = data._difficulty;
    network.hashRate = data._hashRate;
    network.height = data._height;
    network.lastBlockTime = data._lastBlockTime;
    blockNetwork.network = network;

    return blockNetwork;
}