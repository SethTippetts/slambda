# Slambda

[![npm downloads](https://img.shields.io/npm/dm/slambda.svg?style=flat-square)](https://www.npmjs.com/package/slambda)
[![npm version](https://img.shields.io/npm/v/slambda.svg?style=flat-square)](https://www.npmjs.com/package/slambda)

## Install

```
npm i --save slambda
```

## Usage

```js
const Slambda = require('slambda');

// Default values
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

// Create a container
const container = slambda.container('myapi');

// Create a method
container.method('get:user', (user) => {
  delete user.ssn;
  return user;
});

// Deploy
container.deploy();

// Call method
container
  .run('get:user', [{ id: 123, name: 'seth', ssn: '000-00-0000' }])
  .tap(user => console.log('user', user));
```

>*Chainable!?* The above code can be shortened, as all methods except `.run()` are chainable:

```js
// Create a container
slambda
  .container('myapi');
  .method('get:user', (user) => {
    delete user.ssn;
    return user;
  })
  .deploy()
  .run('get:user', [{ id: 123, name: 'seth', ssn: '000-00-0000' }])
  .tap(user => console.log('user', user));
```

## Adapters

Slambda has two types of adapters,
[Storage](https://www.npmjs.com/package/slambda#storage) and
[Execution](https://www.npmjs.com/package/slambda#execution).

All required adapter methods *must* return a [Bluebird](https://www.npmjs.com/package/bluebird) promise.

### Storage

Storage adapters tell Slambda how to persist methods and containers.
The default is [Memory](https://github.com/SethTippetts/slambda/blob/master/strategies/Memory.js).
Storage adapters can take whatever configuration they need.

#### Required methods:

##### `get(String table, String id)`
Returns an entity by ID

##### `findById(String table, String index, String id)`
Query table by index. Resolves to an array.

##### `list(String table)`
Resolves a list of entities from the specified table

##### `put(String table, Object item)`
Upserts an entity

##### `delete(String table, String id)`
Deletes specified entity by ID

>Note: All storage adapter methods *must* return a [Bluebird](https://www.npmjs.com/package/bluebird) promise

#### Officially supported storage adapters:

- [Memory](https://github.com/SethTippetts/slambda/blob/master/strategies/Memory.js) (default)
- [DynamoDB](https://github.com/SethTippetts/slambda-aws-dynamo)
- FileSystem *(Coming soon)*
- AWS S3 *(Coming soon)*
- MongoDB *(Coming soon)*
- Github *(Coming soon)*

### Execution

Execution adapters tell Slambda how to run your code snippets. The default is
[Memory](https://github.com/SethTippetts/slambda/blob/master/strategies/Local.js).

#### Required methods:

##### `run(String containerId, String methodId, Array methodArguments)`
Run a single method with arguments. Returns a promise with the results

##### `deploy(Container container, Array<Method> methods)`
Deploy a container and it's functions to the execution layer

##### `execute(String containerId, Array<String id, Array arguments> calls)`
Run a batch of method calls. Must return an equal length array as `calls`.
Array order must not change.


>Note: All storage adapter methods *must* return a [Bluebird](https://www.npmjs.com/package/bluebird) promise

Where possible, the `.run()` method should try to batch requests.

#### Officially supported execution adapters:

- [Memory](https://github.com/SethTippetts/slambda/blob/master/strategies/Local.js) (default)
- [Local](https://github.com/SethTippetts/slambda-local) (File system)
- [AWS Lambda](https://github.com/SethTippetts/slambda-aws-lambda)
- Google Cloud Functions *(Coming soon)*
- Docker *(Coming soon)*
- AWS EC2 *(Coming soon)*

## API

### Slambda

#### `constructor(Object options)`

##### Parameters
`Object options`

**Defaults**
```js
{
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
}
```

#### `container(String id, Object options)`

##### Returns
`Container`

##### Parameters
`String id` Container ID **Required**

`Object options` Defaults to `this.options.container`

### Container

#### `constructor(Object options)`

##### Parameters
`Object options`

**Defaults**
```js
{
  language: 'nodejs4.3',
  lifecycle: {
    init: () => {},
    pre: () => {},
    post: () => {},
  },
  memory: 1024,
  timeout: 10,
}
```

#### `method(String id, String|Function code)`

##### Returns
`Container`

##### Parameters
`String id` Container-unique identifier for the method

`String|Function code` Method code.

#### `run(String id, Array args)`

##### Returns
`Promise`

##### Parameters
`String id` Method ID to run

`Array args` Arguments passed to method

#### `deploy()`

Deploys function to execution layer. Queues `.run()` commands
behind deployment

##### Returns
`Container`
