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
                var account = new Object();
                account.address = res[i].data._address;
                account.balance = res[i].data._confirmedBalance;
                account.tokenBalances = res[i].data._tokenBalances;
                account.unconfirmedBalance = res[i].data._unconfirmedBalance;
                blockApi.account = account;
                break;
            case 'Block':
                var block = new Object();

                block.difficulty = res[i].data._difficulty;
                block.hash = res[i].data._hash;
                block.number = res[i].data._number;
                block.time = res[i].data._time;
                block.transactionCount = res[i].data._transactionCount;
                blockApi.block = block;
                break;
            case 'Transaction':
                var transaction = new Object();

                transaction.amountSent = res[i].data._amountSent;
                transaction.blockHash = res[i].data._blockHash;
                transaction.hash = res[i].data._hash;
                transaction.recipients = res[i].data._recipients;
                transaction.senders = res[i].data._senders;
                transaction.time = res[i].data._time;
                blockApi.transaction = transaction;
            case 'Network Info':
                var network = new Object();
                network.difficulty = res[i].data._difficulty;
                network.hashRate = res[i].data._hashRate;
                network.height = res[i].data._height;
                network.lastBlockTime = res[i].data._lastBlockTime;
                blockApi.network = network;
        }
    }

    return blockApi;
}