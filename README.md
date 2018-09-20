# blocke-CLI-API
[![Build Status](https://travis-ci.org/BikBikBikBikBik/blocke.svg?branch=master)](https://travis-ci.org/BikBikBikBikBik/blocke/)
[![Test Coverage](https://codeclimate.com/github/BikBikBikBikBik/blocke/badges/coverage.svg)](https://codeclimate.com/github/BikBikBikBikBik/blocke/coverage)
[![Code Climate](https://codeclimate.com/github/BikBikBikBikBik/blocke/badges/gpa.svg)](https://codeclimate.com/github/BikBikBikBikBik/blocke/)

##Copy project https://www.npmjs.com/package/blocke
## Introduction
blocke is a command-line tool to query the blockchain for a variety of cryptocurrencies. View blocks, transactions, accounts (where applicable), and network information. Currently supports:
* AEON
* BCH
* BCN
* BTC
* DASH
* DCR
* DGB
* DOGE
* ETH
* GAME
* KMD
* LSK
* LTC
* RDD
* SC
* SIGT
* VTC
* WAVES
* XDN
* XMR
* ZEC

With more on the way.

<br />

## Installation CLI
```
$ npm install -g blocke-cli-api
```

<br />

## Usage CLI
See `blocke help` and `blocke help <command>` (or the shorter `blocke <command>`) to view more information and instructions, as well as examples:

```
$ blocke help
$ blocke help btc
$ blocke btc
```

<br />

Run `blocke <command> <value>` to automatically search for the right type of `<value>`:

```
$ blocke btc 1JCe8z4jJVNXSjohjM4i9Hh813dLCNx2Sy
$ blocke ltc LdP8Qox1VAhCzLJNqrr74YovaWYyNBUWvL
$ blocke xmr a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721
```

<br />

Run `blocke <command> <option> <value>` to explicitly specify the type of value to retrieve:

```
$ blocke btc -a 1JCe8z4jJVNXSjohjM4i9Hh813dLCNx2Sy
$ blocke btc --account 1JCe8z4jJVNXSjohjM4i9Hh813dLCNx2Sy
$ blocke ltc -t bc6a355ec34194e43a590e86386a771af15c1eb88cc5ce614920a76e36388fe1
$ blocke ltc --transaction bc6a355ec34194e43a590e86386a771af15c1eb88cc5ce614920a76e36388fe1
$ blocke xmr -b a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721
$ blocke xmr --block a886ef5149902d8342475fee9bb296341b891ac67c4842f47a833f23c00ed721
```

<br />

Run `blocke <command> -n` to view network information:

```
$ blocke eth -n
$ blocke eth --network
```

<br />

Multiple option values can be specified by separating them with a single space:

```
$ blocke doge -a DFQc4NVAK7GvFQsHNciE8rcBw6t5ZQ3gdC A2ZA6JHq69WhKB3QxeUHDPokQT2iubUXLB -b 1687655 c151a40f121a4f0ee0078e0268563c8299ad12652f939d9c6880aab9a93c1969 -t 9f2ea5f34d3544ba9abad98251914e9408ba29272c35b6eaaa3abd2c00785a08 6363b3250152e02d80a4ab8faa7b7bae3f731b63417df782ac07dcdf9df0dde1
$ blocke sc -b 115300 102955 0000000000000028ecc091235afb82bd9aca66ebf175137336191ec1d28be993
$ blocke vtc -a VpXm5mcPfjZLuPuK45X69G7UfMPbCkwq2A VaqJQEU6DNFT6psST2yv39HmjHvSuixoyk -t 8f5de2a5417169e89d4104984a7c6e6d520d2ab467c963e18b543bfc6a52786c
$ blocke zec -n -b 150000 -a t3K4aLYagSSBySdrfAGGeUd5H9z5Qvz88t2
```

Many of the services used limit the number of requests allowed in a certain time period. While blocke will never throttle requests, be careful not to request too many values too quickly so as not to get temporarily IP banned.

## Installation API
```
npm install blocke-cli-api
```

## Usage API

```
const blockeApi = require('blocke-api');

blockeApi.executeHandler(coin, options, callback);
```
<blockquote>
OBS: This api use connection async.
</blockquote>

Run code:

```
options = {
    account: [ '1JCe8z4jJVNXSjohjM4i9Hh813dLCNx2Sy' ], // required false
    block: [ '371623' ], // required false
    transaction: [ '5756ff16e2b9f881cd15b8a7e478b4899965f87f553b6210d0f8e5bf5be7df1d' ], // required false
    network: true // required false
};

blockeApi.executeHandler('btc', options, console.log)
```
<blockquote>
<p>OBS: An item is required in options</p>
</blockquote>