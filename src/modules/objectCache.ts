import {excludedRoles} from "./excludedRoles"

export const build = function(objects) {

    let objectCache = {};

    objectCache.props = {};

    objects.array().forEach(o => {
      
      if (objectCache[o.name]) {
        objectCache[o.name+"("+o.calculatedPosition+")"] = o
      } else {
        objectCache[o.name] = o
      }
      
      if (o.constructor.name == "Role") {

        if (!objectCache.props.isMod) {    
          objectCache.props.isMod = o.id == "257983573498265600" || o.id == "530658835036373004"
        }

        if (!objectCache.props.excluded) {
          objectCache.props.excluded = excludedRoles.includes(o.name)
        }
      }
    });
    return objectCache;
}