const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function validateQuery(options = {}) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("options must be an object");
  }

  const page = options.page ?? 1;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const order = options.order ?? "asc";

  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new RangeError(`limit must be an integer between 1 and ${MAX_LIMIT}`);
  }
  if (order !== "asc" && order !== "desc") {
    throw new RangeError('order must be "asc" or "desc"');
  }
  if (options.sortBy !== undefined && typeof options.sortBy !== "string") {
    throw new TypeError("sortBy must be a string");
  }
  if (options.filters !== undefined && (options.filters === null || typeof options.filters !== "object" || Array.isArray(options.filters))) {
    throw new TypeError("filters must be an object");
  }
  if (options.search !== undefined) {
    const search = options.search;
    if (search === null || typeof search !== "object" || Array.isArray(search)) {
      throw new TypeError("search must be an object with query and fields");
    }
    if (typeof search.query !== "string") throw new TypeError("search.query must be a string");
    if (!Array.isArray(search.fields) || search.fields.some((field) => typeof field !== "string")) {
      throw new TypeError("search.fields must be an array of strings");
    }
  }

  return { page, limit, order };
}

export function filterData(data, filters = {}) {
  assertArray(data);
  if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("filters must be an object");
  }
  const entries = Object.entries(filters);
  return data.filter((item) => item !== null && typeof item === "object" && entries.every(([key, value]) => item[key] === value));
}

export function searchData(data, query, fields) {
  assertArray(data);
  if (typeof query !== "string") throw new TypeError("query must be a string");
  if (!Array.isArray(fields) || fields.some((field) => typeof field !== "string")) {
    throw new TypeError("fields must be an array of strings");
  }
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [...data];
  return data.filter((item) => item !== null && typeof item === "object" && fields.some((field) => {
    const value = item[field];
    return value !== null && value !== undefined && String(value).toLocaleLowerCase().includes(needle);
  }));
}

export function sortData(data, field, order = "asc") {
  assertArray(data);
  if (typeof field !== "string" || !field) throw new TypeError("field must be a non-empty string");
  if (order !== "asc" && order !== "desc") throw new RangeError('order must be "asc" or "desc"');
  const direction = order === "asc" ? 1 : -1;
  return [...data].sort((left, right) => {
    const a = left?.[field];
    const b = right?.[field];
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    const comparison = typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
    return comparison * direction;
  });
}

export function paginate(data, options = {}) {
  assertArray(data);
  const { page, limit } = validateQuery(options);
  let result = [...data];
  if (options.filters) result = filterData(result, options.filters);
  if (options.search) result = searchData(result, options.search.query, options.search.fields);
  if (options.sortBy) result = sortData(result, options.sortBy, options.order ?? "asc");

  const totalItems = result.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  return {
    data: result.slice(start, start + limit),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0
    }
  };
}

function assertArray(data) {
  if (!Array.isArray(data)) throw new TypeError("data must be an array");
}
