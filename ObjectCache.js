class ObjectCache {

  constructor(data) {

    if (!(data instanceof Map)) {
      throw new Error("ObjectCache input must be a map")
    }

    // validate input structure
    if (data.size > 0) {
      const validateEl = el => {
        if (typeof el.name != "string") {
          throw new Error("input element missing 'name' property")
        }
      }
      Array.from(data.values()).forEach(validateEl);
    }

    this._cacheById = new Map(data);
    this._cacheByName = new Map();

    data.forEach((el, id) => {

      if (!this._cacheByName.has(el.name)) {
        this._cacheByName.set(el.name, []);
      }

      this._cacheByName.get(el.name).push(el);
    })
  }

  getById(id) {
    return this._cacheById.get(id);
  }

  getByName(name) {
    return this._cacheByName.get(name)[0];
  }
}

module.exports = ObjectCache;