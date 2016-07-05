'use strict';

const debug = require('debug')('slambda');

const constants = require('./constants');
const Container = require('./Container');
const Batch = require('./Batch');

// Default Strategies
const MemoryExec = require('./adapters/MemoryExec');
const MemoryStore = require('./adapters/MemoryStore');

const defaultOptions = {
  autoDeploy: true,
  container: {
    language: 'nodejs4.3',
    lifecycle: {
      init: () => {},
      pre: () => {},
      post: () => {},
    },
    memory: 1024,
    region: 'us-east-1',
    timeout: 10,
  },
  storage: new MemoryStore(),
  execution: new MemoryExec(),
};

class Slambda {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
    this.options.container = Object.assign(
      {},
      defaultOptions.container,
      this.options.container
    );

    this.storage = this.options.storage;
    this.execution = this.options.execution;
  }

  addContainer(id, container) {
    return this.storage.putContainer(Object.assign({ id }, container))
  }

  container(id, container) {
    debug(`#container ID: ${id} Container: ${container}`);
    if (container) {
      this.addContainer();
    }

    return new Container(id, this.storage, this.execution, {
      defaults: this.options.container,
      autoDeploy: this.options.autoDeploy
    });
  }
}


Slambda.Batch = Batch;
Slambda.METHOD_TABLE = constants.METHOD_TABLE;
Slambda.CONTAINER_TABLE = constants.CONTAINER_TABLE;

module.exports = Slambda;
