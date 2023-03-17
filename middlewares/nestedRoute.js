const nestedRouteMapping = {
  "/customer/:customerId/delivery-note/": "/delivery-note/",
  "/customer/:customerId/delivery-note/:id": "/delivery-note/:id",
  "/customer/:customerId/contact/": "/contact/",
  "/customer/:customerId/contact/:id": "/contact/:id",
};

const nestedRoute = (req, res, next) => {
  const reqPaths = req.path.split("/");
  reqPaths.shift();

  for (let targetPath in nestedRouteMapping) {
    const targetPaths = targetPath.split("/");
    targetPaths.shift();

    if (reqPaths.length === targetPaths.length) {
      let match = true;
      let params = {};

      for (let i = 0; i < reqPaths.length; i++) {
        if (targetPaths[i][0] === ":") {
          // This is a parameter
          const paramName = targetPaths[i].slice(1);
          params[paramName] = reqPaths[i];
        } else if (reqPaths[i] !== targetPaths[i]) {
          // The paths don't match
          match = false;
          break;
        }
      }

      if (match) {
        // The paths match, set the params and redirect with query params
        req.params = params;
        const targetRoute = nestedRouteMapping[targetPath].replace(
          /:\w+/g,
          (param) => {
            const paramName = param.slice(1);
            return params[paramName];
          }
        );
        const queryParams = req.query;
        const queryString = Object.keys(queryParams)
          .map((key) => `${key}=${queryParams[key]}`)
          .join("&");
        res.redirect(`${targetRoute}?${queryString}`);
        return;
      }
    }
  }

  next();
};

export default nestedRoute;
