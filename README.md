# PageCraft

PageCraft is a small, dependency-free JavaScript utility for filtering, searching, sorting, and paginating arrays. It uses ES modules and runs on Node.js 18 or newer.

## Install

```sh
npm install pagecraft
```

## Quick start

```js
import { paginate } from "pagecraft";

const users = [
  { id: 1, name: "Sam", role: "student" },
  { id: 2, name: "Alex", role: "admin" },
  { id: 3, name: "Samira", role: "student" }
];

const result = paginate(users, {
  page: 1,
  limit: 2,
  filters: { role: "student" },
  search: { query: "sam", fields: ["name"] },
  sortBy: "name",
  order: "asc"
});

console.log(result.data); // Sam, Samira
console.log(result.pagination);
```

## API

### `paginate(data, options)`

Options are `page` (default `1`), `limit` (default `10`, maximum `100`), `filters` (exact matches; all must match), `search` (`{ query, fields }`, case-insensitive substring match), `sortBy` (property name), and `order` (`"asc"` or `"desc"`, default `"asc"`). Processing order is filtering, searching, sorting, then pagination. Inputs are not mutated. An out-of-range page returns an empty `data` array; empty input has `totalPages: 0`.

Result shape:

```js
{
  data: [],
  pagination: {
    page: 1, limit: 10, totalItems: 0, totalPages: 0,
    hasNextPage: false, hasPreviousPage: false
  }
}
```

### Helpers

- `filterData(data, filters)` returns items that exactly match every filter.
- `searchData(data, query, fields)` searches selected properties. A blank query returns a shallow copy of the input array.
- `sortData(data, field, order)` returns a sorted copy; numbers compare numerically and other values compare as case-insensitive strings. Missing values sort last in ascending order.
- `validateQuery(options)` checks pagination and sorting options and returns normalized `{ page, limit, order }` values.

Invalid arrays, options, page values, limits, orders, and search configurations throw `TypeError` or `RangeError` with a descriptive message.

## Express example

```js
import express from "express";
import { paginate } from "pagecraft";

const app = express();
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
```

## Development

```sh
npm test
npm pack
```

Tests use Node's built-in test runner. PageCraft only operates on arrays already in memory; use database-level queries for large datasets.

## License

MIT. See [LICENSE](LICENSE).
