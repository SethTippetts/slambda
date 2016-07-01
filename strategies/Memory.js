'use strict';

const Bluebird = require('bluebird');
const debug = require('debug')('slambda:storage:Memory');

const constants = require('../constants');

const METHOD_TABLE = constants.METHOD_TABLE;
const CONTAINER_TABLE = constants.CONTAINER_TABLE;

module.exports = class Memory {
  constructor(options) {
    debug('constructor');
    this.store = {
      [METHOD_TABLE]: {},
      [CONTAINER_TABLE]: {},
    };
  }

  get(table, id) {
    debug(`#get() ${JSON.stringify(arguments)}`);
    let item = this.store[table][id];
    if (item) return Bluebird.resolve(item);
    return reject(`Item "${id}" not found in table "${table}"`);
  }

  findById(table, index, id) {
    debug(`#findById() ${JSON.stringify(arguments)}`);
    return Bluebird.resolve(
      Object.keys(this.store[table])
        .reduce((prev, curr) => {
          let val = this.store[table][curr];
          if (!index || val[index] === id) prev.push(val);
          return prev;
        }, [])
    );
  }

  list(table) {
    debug(`#list() ${JSON.stringify(arguments)}`);
    return findById(table);
  }

  put(table, obj) {
    debug(`#put() ${JSON.stringify(arguments)}`);
    this.store[table][obj.id] = obj;
    return Bluebird.resolve(obj);
  }

  delete(table, id) {
    debug(`#delete() ${JSON.stringify(arguments)}`);
    delete this.store[table][id];
    return Bluebird.resolve(id);
  }
}

function reject(msg, ErrClass) {
  if (!ErrClass) ErrClass = Error;
  return Bluebird.reject(new ErrClass(msg));
}
