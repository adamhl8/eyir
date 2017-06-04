class RoleCache {

  constructor(roles) {

    this._cacheById = roles.clone();
    this._cacheByName = new Map();

    roles.forEach((role, roleId) => {

      if (!this._cacheByName.has(role.name)) {
        this._cacheByName.set(role.name, []);
      }

      this._cacheByName.get(role.name).push(role);
    })
  }

  getById(id) {
    return this._cacheById.get(id);
  }

  getByName(name) {
    return this._cacheByName.get(name)[0];
  }
}

module.exports = RoleCache;