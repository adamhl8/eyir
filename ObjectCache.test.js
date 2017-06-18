const ObjectCache = require("./ObjectCache")

test('requries an input Map', () => {

  let f = () => {
    new ObjectCache();
  }

  expect(f).toThrowError(/input must be a map/);
});

test('empty input Map', () => {

  const data = new Map([]);
  new ObjectCache(data);
});

test('invalid input data', () => {

  const data = new Map([
    [0, {}]
  ]);
  let f = () => {
    new ObjectCache(data);
  }

  expect(f).toThrowError(/missing 'name' property/);
});

test('valid input data', () => {

  const values = [
    { name: "a", data: "x"},
    { name: "b", data: "y"},
    { name: "c", data: "z"}
  ];
  const data = new Map([
    [0, values[0]],
    [1, values[1]],
    [2, values[2]]
  ]);
  const cache = new ObjectCache(data);

  expect(cache.getById(0)).toBe(values[0]);
  expect(cache.getById(1)).toBe(values[1]);
  expect(cache.getById(2)).toBe(values[2]);
  expect(cache.getByName("a")).toBe(values[0]);
  expect(cache.getByName("b")).toBe(values[1]);
  expect(cache.getByName("c")).toBe(values[2]);
});

