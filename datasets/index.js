import { readdirSync, readFileSync } from "node:fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getDatasets = () => {
  // get all files
  const files = readdirSync(__dirname);

  // filter only files with .json extension
  // create an object with key {[fileNoExtension]: import(fileWithExtension)}
  const dbs = files
    .filter((file) => path.extname(file) === ".json")
    .map((file) => JSON.parse(readFileSync(`${__dirname}/${file}`, "utf8")));

  // if file doesn't have 'entity': []
  // .map((file) => ({
  //   [path.parse(file).name]: JSON.parse(
  //     readFileSync(`${__dirname}/${file}`, "utf8")
  //   ),
  // }));

  // merge array of object to a single object
  return Object.assign({}, ...dbs);
};
