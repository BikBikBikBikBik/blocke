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

See `blocke help` and `blocke help <command>` to view more information and instructions, as well as examples.