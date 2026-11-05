import test from "node:test";
import assert from "node:assert/strict";
import { filterData, paginate, searchData, sortData, validateQuery } from "../src/index.js";

const users = [
  { id: 1, name: "Sam", role: "student" },
  { id: 2, name: "Alex", role: "admin" },
  { id: 3, name: "Samira", role: "student" },
  { id: 4, name: "John", role: "student" }
];

test("paginate returns a page and metadata", () => {
  assert.deepEqual(paginate(users, { page: 2, limit: 2 }), {
    data: users.slice(2),
    pagination: { page: 2, limit: 2, totalItems: 4, totalPages: 2, hasNextPage: false, hasPreviousPage: true }
  });
});

test("paginate composes filters, search, sort, then pagination", () => {
  const result = paginate(users, { filters: { role: "student" }, search: { query: "sa", fields: ["name"] }, sortBy: "name" });
  assert.deepEqual(result.data.map((user) => user.name), ["Sam", "Samira"]);
  assert.equal(result.pagination.totalItems, 2);
});

test("empty data and out-of-range pages have sensible metadata", () => {
  assert.equal(paginate([], {}).pagination.totalPages, 0);
  assert.deepEqual(paginate(users, { page: 3, limit: 2 }).data, []);
});

test("sortData sorts without mutating input", () => {
  const input = [{ n: 12 }, { n: 2 }];
  assert.deepEqual(sortData(input, "n").map((item) => item.n), [2, 12]);
  assert.deepEqual(input.map((item) => item.n), [12, 2]);
});

test("filterData requires every exact match", () => {
  assert.deepEqual(filterData(users, { role: "student" }).map((user) => user.id), [1, 3, 4]);
});

test("searchData is case insensitive and ignores a blank query", () => {
  assert.deepEqual(searchData(users, "SAM", ["name"]).map((user) => user.id), [1, 3]);
  assert.equal(searchData(users, " ", ["name"]).length, users.length);
});

test("validateQuery returns defaults and rejects invalid values", () => {
  assert.deepEqual(validateQuery({}), { page: 1, limit: 10, order: "asc" });
  assert.throws(() => validateQuery({ page: 0 }), /positive integer/);
  assert.throws(() => validateQuery({ limit: 101 }), /between 1 and 100/);
});
