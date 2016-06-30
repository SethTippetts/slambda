'use strict';

const debug = require('debug')('slambda');

const Container = require('./Container');
const Storage = require('./Storage');

// Default Strategies
const Local = require('./strategies/Local');
const Memory = require('./strategies/Memory');

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
  storage: new Memory(),
  execution: new Local(),
};

module.exports = class Slambda {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);

    this.storage = new Storage(this.options.storage, this.options.container);
    this.execution = this.options.execution;
  }

  container(id, container) {
    debug(`#container ID: ${id} Container: ${container}`);
    if (container) {
      this.storage.putContainer(Object.assign({ id }, container));
    }

    return new Container(id, this.storage, this.execution, { autoDeploy: this.options.autoDeploy });
  }
}



