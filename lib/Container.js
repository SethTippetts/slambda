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
    this.defaults = this.options.defaults;
    this.deploying = Bluebird.resolve();
  }

  /**
  Getter/Setter for method
  @returns Promise|Container
  */
  method(id, code) {
    debug(`#method() ID: ${id} Code: ${(code || '').toString()}`);
    if (!code) return this.storage.getMethod(id, this.id);
    let wait = this.addMethod(id, code);
    if (this.options.autoDeploy) {
      wait
        .then(() => this.deploy())
        .catch(ex => console.error(ex));
    }
    return this;
  }

  addMethod(id, code) {
    let obj = { id, container: this.id };
    if (typeof code !== 'object') obj.code = code;
    else Object.assign(obj, code);
    return this.storage.putMethod(obj);
  }

  // @returns Promise(Array<Method>)
  list() {
    return this.storage.listMethods(this.id);
  }

  // @returns Promise(Any)
  run(id, args) {
    return this.deploying.then(() =>
      this.executor.run(this.id, id, args)
    );
  }

  // @returns Promise(Container)
  promise() {
    return this.storage.getContainer(this.id)
      .then(merge(this.defaults))
      .then(container => {
        if (!container.id) container.id = this.id;
        return container;
      })
      .catch(ex => console.error(ex));
  }

  // @returns Container
  deploy() {
    debug(`#deploy()`);

    this.deploying = Bluebird.all([
      this.promise(),
      this.list(),
    ])
    .spread(this.executor.deploy.bind(this.executor))
    .catch(ex => console.error(ex));

    return this;
  }
}

function merge(defaults) {
  const mergeDefaults = (container) => {
    if (Array.isArray(container)) return container.map(mergeDefaults);
    return Object.assign({}, defaults, container);
  }
  return mergeDefaults;
}
