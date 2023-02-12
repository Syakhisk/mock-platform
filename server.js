import jsonServer from "json-server";
import axios from "axios";

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = process.env["PORT"] || 3000;

server.use(middlewares);

// Custom middleware (convert our query params to json-server query params)
server.use((req, res, next) => {
  if (req.headers["internal"]) return next();

  const mappings = {
    limit: "_limit",
    page: "_page",
    search: "q",
  };

  const defaults = {
    limit: 10,
    page: 1,
  };

  for (let key in mappings) {
    // map query params
    req.query[mappings[key]] = req.query[key] ?? defaults[key];

    // removed unused params
    req.query[key] = undefined;
  }

  req.meta = {
    query: { ...req.query },
  };

  next();
});

// Custom output, `resourceful` format
router.render = async (req, res) => {
  if (req.headers["internal"]) return res.jsonp(res.locals.data);
  const { query } = req.meta;

  const raw = await getRaw(req, query);

  const totalCount = raw.length;
  const totalPage = Math.ceil(totalCount / Number(query._limit));
  const ids = raw.map((i) => i.id);

  // add artificial delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  res.jsonp({
    metadata: {
      count: Number(query._limit),
      page: Number(query._page),
      total_page: totalPage,
      total_count: totalCount,
    },
    data: {
      paginated_result: res.locals.data,
      ids: ids,
    },
  });
};

// Get raw data, used for getting ids and total count
async function getRaw(req, query) {
  const url = `${req.protocol}://${req.hostname}:${PORT}${req.path}`;
  const _res = await axios.get(url, {
    params: {
      ...query,
      _page: undefined,
      _limit: undefined,
    },
    headers: {
      internal: true,
    },
  });

  return _res.data;
}

server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
