# PageCraft

PageCraft is a dependency-free JavaScript utility for filtering, searching, sorting, and paginating arrays of records. It uses ES modules and supports Node.js 18 or newer.

## Install

```sh
npm install @sambuddha_npm_dev/pagecraft
```

## Quick start

```js
import { paginate } from "@sambuddha_npm_dev/pagecraft";

const users = [
  { id: 1, name: "Sam", role: "student" },
  { id: 2, name: "Alex", role: "admin" },
  { id: 3, name: "Samira", role: "student" },
  { id: 4, name: "Jordan", role: "student" }
];

const result = paginate(users, {
  page: 1,
  limit: 2,
  filters: { role: "student" },
  search: { query: "sam", fields: ["name"] },
  sortBy: "name",
  order: "asc"
});

console.log(result.data.map((user) => user.name)); // ["Sam", "Samira"]
console.log(result.pagination);
```

## API

### `paginate(data, options = {})`

Processes an array in this order: filters, search, sorting, then pagination. It returns a new array and does not mutate the input.

| Option | Type | Default | Behavior |
|---|---|---|---|
| `page` | integer | `1` | One-based page number; must be positive. |
| `limit` | integer | `10` | Items per page; must be from `1` to `100`. |
| `filters` | object | none | Each property must match a record property using strict equality; every filter must match. |
| `search` | `{ query, fields }` | none | Case-insensitive substring search in the listed fields. `query` is a string and `fields` is an array of strings. |
| `sortBy` | string | none | Record property to sort by. An empty string does not enable sorting. |
| `order` | `"asc"` or `"desc"` | `"asc"` | Sort direction. |

Example result:

```js
{
  data: [{ id: 1, name: "Sam", role: "student" }],
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }
}
```

`totalItems` and `totalPages` describe the filtered, searched, and sorted records before slicing. A page beyond the last page returns an empty `data` array. Empty input has `totalPages: 0`.

### `filterData(data, filters = {})`

Returns records matching every filter with strict equality (`===`).

```js
import { filterData } from "@sambuddha_npm_dev/pagecraft";

const students = filterData(
  [{ name: "Sam", role: "student" }, { name: "Alex", role: "admin" }],
  { role: "student" }
);
```

### `searchData(data, query, fields)`

Returns records where at least one selected field contains the trimmed query, case-insensitively. Field values are converted to strings. A blank query returns a shallow copy of the input array.

```js
import { searchData } from "@sambuddha_npm_dev/pagecraft";

const matches = searchData([{ name: "Sam" }, { name: "Alex" }], "SAM", ["name"]);
```

### `sortData(data, field, order = "asc")`

Returns a sorted copy. When both values are numbers they sort numerically; otherwise they compare as case-insensitive strings with numeric-aware ordering. Null or missing values sort last ascending and first descending.

```js
import { sortData } from "@sambuddha_npm_dev/pagecraft";

const sorted = sortData([{ name: "Sam" }, { name: "Alex" }], "name", "desc");
```

### `validateQuery(options = {})`

Validates the `page`, `limit`, and `order` values and checks the types of `sortBy`, `filters`, and `search`. It returns normalized pagination and order defaults:

```js
import { validateQuery } from "@sambuddha_npm_dev/pagecraft";

const query = validateQuery({ page: 2, limit: 5 });
// { page: 2, limit: 5, order: "asc" }
```

Invalid top-level inputs and malformed filters/search options throw `TypeError`; invalid page, limit, or order values throw `RangeError`. `paginate`, `filterData`, `searchData`, and `sortData` require `data` to be an array. Filtering and searching are intended for arrays of object records; non-object entries do not match those operations.

## Express example

```js
import express from "express";
import { paginate } from "@sambuddha_npm_dev/pagecraft";

const app = express();
const users = [
  { id: 1, name: "Sam", role: "student" },
  { id: 2, name: "Alex", role: "admin" }
];

app.get("/users", (req, res) => {
  try {
    const result = paginate(users, {
      page: req.query.page === undefined ? 1 : Number(req.query.page),
      limit: req.query.limit === undefined ? 10 : Number(req.query.limit),
      sortBy: req.query.sortBy,
      order: req.query.order
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000);
```

## Development

```sh
npm test
npm pack
```

The tests use Node.js's built-in test runner. PageCraft processes data in memory; for large datasets, use database-level filtering and pagination.

## License

MIT. See [LICENSE](LICENSE).
