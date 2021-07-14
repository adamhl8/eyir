import { Collection } from 'discord.js'

interface CacheableValue {
  name: string
}

export default class ObjectCache<V extends CacheableValue> extends Map<string, V> {
  private constructor(entries: Array<[string, V]> = []) {
    super(entries)
  }

  static empty<V extends CacheableValue>(): ObjectCache<V> {
    return new ObjectCache<V>()
  }

  static fromCollection<V extends CacheableValue>(collection: Collection<unknown, V>): ObjectCache<V> {
    const byName: Array<[string, V]> = collection.map((item) => [item.name, item])
    return new ObjectCache(byName)
  }

  getOrThrow(key: string): V {
    const value = this.get(key)
    if (!value) {
      throw new Error(`no value for key '${key}' in this cache`)
    }

    return value
  }
}
