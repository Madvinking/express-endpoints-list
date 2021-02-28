const { METHODS } = require('http');

const defaultOptions = {
  mergeHandlers: true,
  handlers: true,
  middlewares: false,
  params: false,
};

module.exports = function getEndpoints(app, recivedOptions = {}) {
  const options = {
    ...defaultOptions,
    ...recivedOptions,
  };
  const uniqByPathAndMethod = routes => {
    return Object.values(
      routes.reduce((acc, route) => {
        const uniqId = route.path + route.method;

        if (acc[uniqId]) {
          acc[uniqId].handle.push(route.handle);
        } else {
          acc[uniqId] = route;
          route.handle = [route.handle];
        }

        return acc;
      }, {}),
    );
  };

  const routersRecursive = routes => {
    const routerRoutes = [];

    const doRecursive = (currentRoutes, path = '') => {
      currentRoutes.forEach(r => {
        if (r.route && r.route.stack) {
          if (r.route && r.route.methods && r.route.methods._all) {
            METHODS.forEach(method => {
              const newStack = r.route.stack.map(s => {
                s.method = method.toLowerCase();

                return s;
              });

              if (Array.isArray(r.route.path)) {
                r.route.path.forEach(p => doRecursive(newStack, path + p));
              } else {
                doRecursive(newStack, path + r.route.path);
              }
            });
          } else if (Array.isArray(r.route.path)) {
            r.route.path.forEach(p => doRecursive(r.route.stack, path + p));
          } else {
            doRecursive(r.route.stack, path + r.route.path);
          }
        } else if (r.name === 'router' && r.handle && r.handle.stack) {
          doRecursive(r.handle.stack, path);
        } else if (r.method || options.middlewares) {
          routerRoutes.push({ ...r, path });
        }
      });
    };

    doRecursive(routes);

    return routerRoutes;
  };

  const rawRoutes = routersRecursive(app._router.stack);

  const uniqRoutes = options.mergeHandlers ? uniqByPathAndMethod(rawRoutes) : rawRoutes;

  const finalRoutes = uniqRoutes.map(({ path, handle, params, method, name }) => ({
    path,
    ...(options.handlers && { handle }),
    ...(options.params && { params }),
    method: method ? method.toLowerCase() : `middleware${options.mergeHandlers ? 's' : `:${name}`}`,
  }));

  return finalRoutes;
};
