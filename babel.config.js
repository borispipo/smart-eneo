module.exports = function(api) {
    const path = require("path");
    const dir = path.resolve(__dirname);
    const src = path.resolve(dir,"src");
    const environmentPath = path.resolve(dir,".env");
    const alias = {
      $screens : path.resolve(src,"screens"),
      $socket : path.resolve(src,"socket"),
      $api : path.resolve(src,"api"),
      $drawerItems : path.resolve(src,"navigation","drawerItems"),
      $database : path.resolve(src,"database"),
      $getLoginProps : path.resolve(src,"auth","getLoginProps"),
      $logoComponent : path.resolve(src,"logo"),
    }
    return require(require("./expo-ui-path")()+"/babel.config")(api,{environmentPath,base :dir,alias});
  };