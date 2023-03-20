import jsonServer from "json-server";
import axios from "axios";
import { getDatasets } from "./datasets/index.js";
import nestedRoute from "./middlewares/nestedRoute.js";

const dataset = getDatasets();
const server = jsonServer.create();
const router = jsonServer.router(dataset);
const middlewares = jsonServer.defaults();

const PORT = process.env["PORT"] || 3000;

server.use(middlewares);

// Customer middleware to handle nested route
server.use(nestedRoute);

// Custom middleware (convert our query params to json-server query params)
server.use(async (req, res, next) => {
  if (req.headers["internal"]) return next();
  console.log("req.query", req.query);
  const mappings = {
    limit: "_limit",
    page: "_page",
    search: "q",
    sorts: "_sort",
  };

  const defaults = {
    limit: 10,
    page: 1,
  };

  for (let key in mappings) {
    // map query params
    if (key === "sorts" && req.query["sorts"]) {
      // Multiple sort would not work, will use last sort element instead
      const sort = req.query["sorts"].pop();
      const split = sort.split(" ");
      req.query["_sort"] = split[0] ?? defaults[key];
      req.query["_order"] = split[1] ?? defaults[key];
    } else {
      req.query[mappings[key]] = req.query[key] ?? defaults[key];
    }

    // removed unused params
    req.query[key] = undefined;
  }

  req.meta = {
    query: { ...req.query },
    resourceful:
      req.query['_resourceful'] ||
      (req.path.split("/").length <= 2 && req.method == "GET"),
  };

  // if (req.method == "POST" && req.path == "/product-type") {
  // const product_category_id = req.body?.data?.product_category_id;
  // console.log(req.protocol)
  // delete req.body.data.product_category_id;

  // let _req = {...req};
  // _req.path = `${req.path}/${product_category_id}`;

  // const raw = await getRaw(_req);

  // const raw = await getRaw({
  //   ...req,
  //   path: ,
  // });

  // console.log({ raw });
  // }

  next();
});

// Custom output, `resourceful` format
router.render = async (req, res) => {
  // if 'internal' headers present, return raw data
  if (req.headers["internal"]) return res.jsonp(res.locals.data);
  // if data is not resourceful (show, update, delete)
  // skip the rest
  if (!req.meta.resourceful) {
    return res.jsonp({
      data: res.locals.data,
    });
  }

  const { query } = req.meta;

  const raw = await getRaw(req, query);

  const totalCount = raw.length;
  const totalPage = Math.ceil(totalCount / Number(query._limit));
  const ids = Array.isArray(raw) ? raw.map((i) => i.id) : [];

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

// simulate error
// server.patch("/product-category/:id", (req, res) => {
//   return res.sendStatus(500);
// });

// server.get("/product-category/:id", (req, res) => {
//   return res.sendStatus(500);
// });

// server.post("/product-category", (req, res) => {
//   return res.status(400).send({
//     message: "validation error",
//     errors: {
//       name: ["validation message"],
//       min_temperature: ["validation message min_temp"],
//     },
//   });
// });

server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
