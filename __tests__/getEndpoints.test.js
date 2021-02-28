const express = require('express');
const getEndpoints = require('../src/');
const allMethods = require('http').METHODS;

const bodyParser = require('body-parser');

const anonymousFunction = () => {};
const path2Handler1 = () => {};
const path2Handler2 = () => {};

const bodyParserMiddleware = bodyParser.json({ type: '*/json' });
const createApp = () => {
  const app = express();

  app.get('/path1', bodyParserMiddleware, anonymousFunction);

  app.put('/path2', path2Handler1, path2Handler2);

  app.post('/path3/:param1/:param2', anonymousFunction);

  app.all('/path4', anonymousFunction);

  app.use(bodyParserMiddleware);

  app.use(anonymousFunction);

  const router1 = express.Router();
  const router2 = express.Router();
  const router3 = express.Router();
  const router4 = express.Router();
  const router5 = express.Router();

  router1.get('/path5', anonymousFunction);
  app.use(router1);

  router2.post('/path7', anonymousFunction);
  app.get('/path6', router2);

  router3.all('/path8', anonymousFunction);
  app.use(router3);

  router5.delete('/path11', anonymousFunction);
  router4.get('/path10', router5);
  app.put('/path9', router4);

  return app;
};

const routes = [
  {
    path: '/path1',
    handle: [bodyParserMiddleware, anonymousFunction],
    params: undefined,
    method: 'get',
  },
  {
    path: '/path2',
    handle: [path2Handler1, path2Handler2],
    params: undefined,
    method: 'put',
  },
  {
    path: '/path3/:param1/:param2',
    handle: [anonymousFunction],
    params: undefined,
    method: 'post',
  },
  ...allMethods.map(method => ({
    path: '/path4',
    handle: [anonymousFunction],
    params: undefined,
    method: method.toLowerCase(),
  })),
  {
    path: '/path5',
    handle: [anonymousFunction],
    params: undefined,
    method: 'get',
  },
  {
    path: '/path6/path7',
    handle: [anonymousFunction],
    params: undefined,
    method: 'post',
  },
  ...allMethods.map(method => ({
    path: '/path8',
    handle: [anonymousFunction],
    params: undefined,
    method: method.toLowerCase(),
  })),
  {
    path: '/path9/path10/path11',
    handle: [anonymousFunction],
    params: undefined,
    method: 'delete',
  },
];

describe('express list endpoints', () => {
  test('should return route descriptor default opitons', () => {
    const app = createApp();

    const endpoints = getEndpoints(app);

    expect(endpoints).toEqual(routes);
  });

  test('dont ignore middlewares', () => {
    const app = createApp();
    const currentRoutes = [...routes];

    const middlewaresRoute = {
      path: '',
      handle: [],
      params: undefined,
      method: 'middlewares',
    };
    const endpoints = getEndpoints(app, { middlewares: true });
    const firstRoute = endpoints.shift();
    expect(firstRoute.method).toEqual(middlewaresRoute.method);
    expect(firstRoute.handle.length).toEqual(4);
    expect(firstRoute.handle.includes(bodyParserMiddleware)).toEqual(true);
    expect(endpoints).toEqual(currentRoutes);
  });

  test('dont merge handlers', () => {
    const app = createApp();
    const currentRoutes = [...routes].map(({ handle, ...rest }) => handle.map(h => ({ handle: h, ...rest }))).flat();

    const endpoints = getEndpoints(app, { mergeHandlers: false });

    expect(endpoints).toEqual(currentRoutes);
  });
});
