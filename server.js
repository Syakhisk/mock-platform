const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use((req, res, next) => {
  // defaults
  req.query._limit = 10;
  req.query._page = 1;

  // overwrites
  if (req.query.limit) req.query._limit = req.query.limit;
  if (req.query.page) req.query._page = req.query.page;
  if (req.query.search) req.query.q = req.query.search;

  req.meta = {
    limit: req.query._limit,
    page: req.query._page,
  };

  next();
});

router.render = async (req, res) => {
  const totalCount = res.getHeader("x-total-count");

  // // workaround to get ids
  // const x = await fetch(req.protocol + '://' + req.host + ":3000" + req.path)
  // constole.log(await x.json())

  res.jsonp({
    metadata: {
      count: +req.meta.limit,
      page: +req.meta.page,
      total_page: Math.ceil(+totalCount / +req.meta.limit),
      total_count: totalCount,
    },
    data: {
      paginated_result: res.locals.data,
      ids: [],
    },
  });
};

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
