'use strict';

const Bluebird = require('bluebird');

const debug = require('debug')('slambda:Container');

module.exports = class Container {
  constructor(id, storage, executor, options) {
    debug(`constructor ID: ${id}`);
    this.id = id;
    this.storage = storage;
    this.executor = executor;

    this.options = options;
  }

  method(id, code) {
    debug(`#method() ID: ${id} Code: ${code.toString()}`);
    let wait = this.storage.putMethod({ id, container: this.id, code })
    if (this.options.autoDeploy) {
      wait
        .then(() => this.deploy())
        .catch(ex => console.error(ex));
    }
    return this;
  }

  run(id, args) {
    return this.executor.run(this.id, id, args);
  }

  deploy() {
    debug(`#deploy()`);
    return Bluebird.all([
      this.storage.getContainer(this.id),
      this.storage.listMethods(this.id),
    ])
    .spread(this.executor.deploy.bind(this.executor))
    .catch(ex => console.error(ex));
  }
}

