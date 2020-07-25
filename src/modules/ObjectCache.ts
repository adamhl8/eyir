import { Collection } from "discord.js"

type CacheableValue = { name: string }

export default class ObjectCache<V extends CacheableValue> extends Map<string, V> {
  static empty<V extends CacheableValue>(): ObjectCache<V> {
    return new ObjectCache<V>()
  }

  static fromCollection<V extends CacheableValue>(collection: Collection<any, V>): ObjectCache<V> {
    const byName: Array<[string, V]> = collection.map((item) => [item.name, item])
    return new ObjectCache(byName)
  }

  private constructor(entries: Array<[string, V]> = []) {
    super(entries)
  }

  getOrThrow(key: string): V {
    const value = this.get(key)
    if (!value) {
      throw Error(`no value for key '${key}' in this cache`)
    }

    return value
  }
}
