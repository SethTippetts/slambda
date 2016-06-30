'use strict';

const tables = require('slambda-utils').constants.tables;

const METHOD = tables.METHOD;
const CONTAINER = tables.CONTAINER;

const debug = require('debug')('slambda:storage');

module.exports = class Storage {
  constructor(service, containerDefaults) {
    this.service = service;

    this.containerDefaults = containerDefaults;
  }

  getMethod(methodId) {
    debug(`#getMethod() ${JSON.stringify(arguments)}`);
    return this.service.get(METHOD, methodId);
  }

  listMethods(containerId) {
    debug(`#listMethods() ${JSON.stringify(arguments)}`);
    return this.service.findById(METHOD, 'container', containerId)
  }

  putMethod(method) {
    debug(`#putMethod() ${JSON.stringify(arguments)}`);
    return this.service.put(METHOD, method);
  }

  deleteMethod(methodId) {
    debug(`#deleteMethod() ${JSON.stringify(arguments)}`);
    return this.service.delete(METHOD, method);
  }

  getContainer(containerId) {
    debug(`#getContainer() ${JSON.stringify(arguments)}`);
    return this.service.get(CONTAINER, containerId)
      .catch(() => ({}))
      .then(merge(this.containerDefaults))
      .then(container => {
        if (!container.id) container.id = containerId;
        return container;
      });
  }

  listContainers() {
    debug(`#listContainers() ${JSON.stringify(arguments)}`);
    return this.service.list(CONTAINER)
      .then(merge(this.containerDefaults))
  }

  putContainer(container) {
    debug(`#putContainer() ${JSON.stringify(arguments)}`);
    return this.service.delete(CONTAINER, container);
  }

  deleteContainer(containerId) {
    debug(`#deleteContainer() ${JSON.stringify(arguments)}`);
    return this.service.delete(CONTAINER, containerId);
  }


}

function merge(defaults) {
  const mergeDefaults = (container) => {
    if (Array.isArray(container)) return container.map(mergeDefaults);
    return Object.assign({}, defaults, container);
  }
  return mergeDefaults;
}
