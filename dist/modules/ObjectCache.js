"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectCache extends Map {
    getOrThrow(key) {
        const value = this.get(key);
        if (!value) {
            throw Error(`no value for key '${key}' in this cache`);
        }
        return value;
    }
}
exports.default = ObjectCache;
//# sourceMappingURL=ObjectCache.js.map