'use strict';

const Bluebird = require('bluebird');
const debug = require('debug')('slambda:execution:Memory');

const Batch = require('../lib/Batch');
const Method = require('../lib/Method');

module.exports = class Local {
  constructor(options) {
    debug(`constructor`);
    this.containers = {};

    let batch = new Batch(this.execute.bind(this));
    this.run = batch.run.bind(batch);
  }

  deploy(container, methods) {
    debug(`#deploy() Container: ${container.id} Methods: ${methods.length}`);
    let containerClone = Object.assign({}, container, {
      ctx: new Method(container.lifecycle.init).run(),
      methods: methods.reduce((prev, curr) => {
        prev[curr.id] = new Method(curr.code.toString());
        return prev;
      }, {}),
    });
    this.containers[containerClone.id] = containerClone;
  }

  execute(id, calls) {
    let container = this.containers[id];
    let methods = container.methods;
    let ctx = container.ctx;
    debug(`#execute() Calls: ${calls.length}`);
    return Bluebird.all(
      calls
        .map(method => {
          let fn = methods[method.id];
          if (typeof fn === 'undefined') return Bluebird.resolve(method.arguments).reflect();

          return fn.run(clone(method.arguments), ctx)
            .timeout((container.timeout * 1000) - 100)
            .catch(Bluebird.TimeoutError, function(e) {
              throw new Error(`Function timeout out in ${timeout}ms`);
            })
            .reflect();
        })
    )
    .then(results => results.map(result => {
      if (result.isRejected()) {
        return result.reason();
      }
      return result.value();
    }))
  }
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
