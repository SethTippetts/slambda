'use strict';

const Bluebird = require('bluebird');
const Batch = require('../../Batch');
const Method = require('../../Method');
const debug = require('debug')('slambda:execution:Local');

module.exports = class Local {
  constructor(options) {
    debug(`constructor`);
    this.methods = {};

    let batch = new Batch(this.execute.bind(this));
    this.run = batch.run.bind(batch);
  }

  deploy(container, methods) {
    debug(`#deploy() Container: ${container.id} Methods: ${methods.length}`);
    this.ctx = new Method(container.lifecycle.init).run()
    this.container = container;
    this.methods = methods.reduce((prev, curr) => {
      prev[curr.id] = new Method(curr.code.toString());
      return prev;
    }, {});
  }

  execute(id, calls) {
    debug(`#execute() Calls: ${calls.length}`);
    return Bluebird.all(
      calls
        .map(method => {
          let fn = this.methods[method.id];
          if (typeof fn === 'undefined') return Bluebird.resolve(method.arguments).reflect();

          return fn.run(method.arguments, this.ctx)
            .timeout((this.container.timeout * 1000) - 100)
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

