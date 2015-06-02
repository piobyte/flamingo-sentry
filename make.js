#!/usr/bin/env node
/* global target, echo, find, exit, exec */

require('shelljs/make');

var some = require('lodash.some');

var NODE_MODULES = './node_modules/',
    MAKEFILE = './make.js',
    ESLINT = NODE_MODULES + 'eslint/bin/eslint.js',
    JS_FILES = [].concat('index.js').join(' ');

target.all = function () {
    target.test();
};

target.lint = function () {
    if(some([
        exec(ESLINT + ' ' + MAKEFILE).code,
        exec(ESLINT + ' ' + JS_FILES).code
    ])) {
        exit(1);
    }
};

target.test = function () {
    target.lint();
};
