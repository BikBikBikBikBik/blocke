# blocke
Command-line tool to query the blockchain for a variety of cryptos. View blocks, transactions, and accounts (where applicable). Currently supports:
* AEON
* BTC
* DASH
* DCR
* DGB
* DOGE
* ETH
* KMD
* LTC
* RDD
* SC
* VTC
* WAVES
* XMR
* ZEC

With more on the way.

<br />

# Installation
```
$ npm install -g blocke
```

### Troubleshooting
If you encounter errors regarding sha3 during installation, try installing from source. 

The recommended way is using a release available [here](https://github.com/BikBikBikBikBik/blocke/releases):

```
$ wget https://github.com/BikBikBikBikBik/blocke/archive/vX.Y.Z.zip
$ unzip vX.Y.Z.zip && cd blocke-X.Y.Z
$ npm install
$ npm link
```

Alternatively, clone the repository for the latest (potentially unreleased) version:

```
$ git clone https://github.com/BikBikBikBikBik/blocke.git
$ cd blocke
$ npm install
$ npm link
```

<br />

# Usage
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

Multiple option values can be specified by separating them with a single space:

```
$ blocke doge -a DFQc4NVAK7GvFQsHNciE8rcBw6t5ZQ3gdC A2ZA6JHq69WhKB3QxeUHDPokQT2iubUXLB -b 1687655 c151a40f121a4f0ee0078e0268563c8299ad12652f939d9c6880aab9a93c1969 -t 9f2ea5f34d3544ba9abad98251914e9408ba29272c35b6eaaa3abd2c00785a08 6363b3250152e02d80a4ab8faa7b7bae3f731b63417df782ac07dcdf9df0dde1
$ blocke sc -b 115300 102955 0000000000000028ecc091235afb82bd9aca66ebf175137336191ec1d28be993
$ blocke vtc -a VpXm5mcPfjZLuPuK45X69G7UfMPbCkwq2A VaqJQEU6DNFT6psST2yv39HmjHvSuixoyk -t 8f5de2a5417169e89d4104984a7c6e6d520d2ab467c963e18b543bfc6a52786c
```

Many of the services used limit the number of requests allowed in a certain time period. While blocke will never throttle requests, be careful not to request too many values too quickly so as not to get temporarily IP banned.