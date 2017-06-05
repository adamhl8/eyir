class ChannelCache {

  constructor(channels) {

    this._cacheById = channels.clone();
    this._cacheByName = new Map();

    channels.forEach((channel, channelID) => {

      if (!this._cacheByName.has(channel.name)) {
        this._cacheByName.set(channel.name, []);
      }

      this._cacheByName.get(channel.name).push(channel);
    })
  }

  getById(id) {
    return this._cacheById.get(id);
  }

  getByName(name) {
    return this._cacheByName.get(name)[0];
  }
}

module.exports = ChannelCache;