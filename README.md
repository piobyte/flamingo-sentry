# flamingo-sentry
[![Build Status](https://travis-ci.org/piobyte/flamingo-sentry.png?branch=master)](https://travis-ci.org/piobyte/flamingo-sentry)
[![Dependency Status](https://david-dm.org/piobyte/flamingo-sentry.svg)](https://david-dm.org/piobyte/flamingo-sentry)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo-sentry.png)](https://codeclimate.com/github/piobyte/flamingo-sentry)
![npm version](https://badge.fury.io/js/flamingo-sentry.svg)
![MIT licensed](https://img.shields.io/github/license/piobyte/flamingo-sentry.svg)

`flamingo-sentry` is a [flamingo](https://github.com/piobyte/flamingo) addon that enables error logging to [sentry](https://www.getsentry.com/welcome/).

## Env

`SENTRY_DSN` => `SENTRY_DSN`

## Config

```js
return {
    SENTRY_DSN: 'http://dc462d2107cfc8d8f722043f1181ae4d:c1d154a0e7cedf19b070fa252534bd14@sentry.example.org:1234/5'
};
```
<!--- 'http://' + chance.hash({length: 32}) + ':' + chance.hash({length:32}) + '@sentry.example.org:1234/5' -->

## Example

1. `npm i --save flamingo-sentry`
2. `SENTRY_DSN=your.sentry.dsn node path/to/flamingo/index.js`