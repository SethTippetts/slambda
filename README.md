# Slambda

Sandbox code execution _ANYWHERE_

## Basic Usage

```js
const Slambda = require('slambda');

const slambda = new Slambda({
  autoDeploy: true,
  container: {
    language: 'nodejs4.3',
    lifecycle: {
      init: () => {},
      pre: () => {},
      post: () => {},
    },
    memory: 1024,
    timeout: 10,
  },
  storage: new MemoryStore(),
  execution: new MemoryExec(),
});

// Reference a container
const container = slambda.container('mycontainername');

// Create a method
container
  .method('mask:ssn', (ssn) => `***-**-${ssn.substr(8)}`);


container
  .deploy()
  .then(() => container.run('mask:ssn', '000-00-0001'))
```
