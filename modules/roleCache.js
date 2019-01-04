const ExcludedRoles = require("./excludedRoles.js");

exports.build = function(roles) {

    let roleCache = {};

    roles.array().forEach(r => {
  
      roleCache[r.name] = {}
  
      roleCache[r.name].role = r;
      
      if (ExcludedRoles.roles.includes(r.id)) {
        roleCache[r.name].excluded = true
      }
      else {
        roleCache[r.name].excluded = false
      }
    });
  
    return roleCache;
}