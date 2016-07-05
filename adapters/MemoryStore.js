'use strict';

const Bluebird = require('bluebird');
const debug = require('debug')('slambda:storage:Memory');

const constants = require('../constants');

const METHOD_TABLE = constants.METHOD_TABLE;
const CONTAINER_TABLE = constants.CONTAINER_TABLE;
const INDEX_SEPARATOR = constants.INDEX_SEPARATOR;

module.exports = class Memory {
  constructor(options) {
    debug('constructor');
    this.store = {
      [METHOD_TABLE]: {},
      [CONTAINER_TABLE]: {},
    };
  }

  buildCompoundIndex(containerId, methodId) {
    return `${containerId}${INDEX_SEPARATOR}${methodId}`
  }

  getMethod(methodId, containerId) {
    debug(`#getMethod() ${JSON.stringify(arguments)}`);
    let id = this.buildCompoundIndex(containerId, methodId);
    let item = this.store[METHOD_TABLE][id] || null;
    return Bluebird.resolve(item);
  }

  listMethods(containerId) {
    debug(`#listMethods() ${JSON.stringify(arguments)}`);
    let methods = Object.keys(this.store[METHOD_TABLE])
      .filter(key => key.startsWith(containerId))
      .map(key => this.store[METHOD_TABLE][key]);

    return Bluebird.resolve(methods);
  }

  putMethod(method) {
    debug(`#putMethod() ${JSON.stringify(arguments)}`);
    let id = this.buildCompoundIndex(method.container, method.id);

    this.store[METHOD_TABLE][id] = method;

    return Bluebird.resolve(method);
  }

  deleteMethod(methodId, containerId) {
    debug(`#deleteMethod() ${JSON.stringify(arguments)}`);
    let id = this.buildCompoundIndex(containerId, methodId);

    delete this.store[METHOD_TABLE][id];

    return Bluebird.resolve(id);
  }

  getContainer(containerId) {
    debug(`#getContainer() ${JSON.stringify(arguments)}`);
    return Bluebird.resolve(this.store[CONTAINER_TABLE][containerId]);
  }

  listContainers() {
    debug(`#listContainers() ${JSON.stringify(arguments)}`);
    return Bluebird.resolve(this.toList(this.store[CONTAINER_TABLE]));
  }

  putContainer(container) {
    debug(`#putContainer() ${JSON.stringify(arguments)}`);
    container.methods = container.methods || [];
    this.store[CONTAINER_TABLE][container.id] = container;
    return Bluebird.resolve(container);
  }

  deleteContainer(containerId) {
    debug(`#deleteContainer() ${JSON.stringify(arguments)}`);
    delete this.store[CONTAINER_TABLE][containerId];
    return Bluebird.resolve(containerId);
  }

  toList(obj) {
    debug(`#toList() ${JSON.stringify(arguments)}`);
    return Object.keys(obj)
      .map(key => obj[key]);
  }
}
