# express-endpoints-list

![npm](https://img.shields.io/npm/v/express-endpoints-list)

- return all express registered endpoints with their handlers.
- works on express router instance and sub express routers.
- configurable.

## Example

```
  const express = require('express');
  const getEndpoints = require('express-endpoints-list');

  const app = express();
  const bodyParserMiddleware = bodyParser.json({});

  const router1 = express.Router();
  const router2 = express.Router();
  const router3 = express.Router();
  const router4 = express.Router();
  const router5 = express.Router();

  app.get('/path1', bodyParserMiddleware, anonymousFunction);
  app.put('/path2', path2Handler1, path2Handler2);
  app.post('/path3/:param1/:param2', anonymousFunction);
  app.all('/path4', anonymousFunction);
  app.use(bodyParserMiddleware);
  app.use(anonymousFunction);

  router1.get('/path5', anonymousFunction);
  app.use(router1);
  router2.post('/path7', anonymousFunction);
  app.get('/path6', router2);
  router3.all('/path8', anonymousFunction);
  app.use(router3);
  router5.delete('/path11', anonymousFunction);
  router4.get('/path10', router5);
  app.put('/path9', router4);

  cosnt endpoints = getEndpoints(app, {options}); // options is optional
  console.log(endpoints);
  //
[
  {
    path: '/path1',
    handle: [bodyParserMiddleware, anonymousFunction],
    method: 'get',
  },
  {
    path: '/path2',
    handle: [path2Handler1, path2Handler2],
    method: 'put',
  },
  {
    path: '/path3/:param1/:param2',
    handle: [anonymousFunction],
    method: 'post',
  },
  // on each express supported method:
  ...allMethods.map(method => ({
    path: '/path4',
    handle: [anonymousFunction],
    method: method.toLowerCase(),
  })),
  {
    path: '/path5',
    handle: [anonymousFunction],
    method: 'get',
  },
  {
    path: '/path6/path7',
    handle: [anonymousFunction],
    method: 'post',
  },
  // on each express supported method:
  ...allMethods.map(method => ({
    path: '/path8',
    handle: [anonymousFunction],
    method: method.toLowerCase(),
  })),
  {
    path: '/path9/path10/path11',
    handle: [anonymousFunction],
    method: 'delete',
  },
]
```

### options

- handlers: (default true), - add handles functions to the list
- mergeHandlers (default false) - all handles for same path and method will be in array of handles.
- middlewares: (default false) - list also middlewares.
- params: (default false) - in case of using express params middleware.
