# decaffeinate-parser [![Build Status](https://travis-ci.org/decaffeinate/decaffeinate-parser.svg?branch=master)](https://travis-ci.org/decaffeinate/decaffeinate-parser) [![package version](https://badge.fury.io/js/decaffeinate-parser.svg)](https://badge.fury.io/js/decaffeinate-parser) [![Greenkeeper badge](https://badges.greenkeeper.io/decaffeinate/decaffeinate-parser.svg)](https://greenkeeper.io/)

This project uses the [official CoffeeScript
parser](https://github.com/jashkenas/coffeescript) to parse CoffeeScript source
code, then maps the AST generated by the parser to one more suitable for the
[decaffeinate project](https://github.com/eventualbuddha/decaffeinate) (based on
the AST generated by
[CoffeeScriptRedux](https://github.com/michaelficarra/CoffeeScriptRedux)).

This project might be useful to anyone who wants to work with a CoffeeScript
AST and prefers working with a saner AST.

## Install

```bash
# via yarn
$ yarn add decaffeinate-parser
# via npm
$ npm install decaffeinate-parser
```

## Usage

This example gets the names of the parameters in the `add` function:

```js
import { parse } from 'decaffeinate-parser';

let program = parse('add = (a, b) -> a + b');
let assignment = program.body.statements[0];
let fn = assignment.expression;

console.log(fn.parameters.map(param => param.data)); // [ 'a', 'b' ]
```
