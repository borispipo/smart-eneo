module.exports = function(api) {
    const path = require("path");
    const dir = path.resolve(__dirname);
    const src = path.resolve(dir,"src");
    const alias = {
      $screens : path.resolve(src,"screens"),
      $socket : path.resolve(src,"socket"),
      $api : path.resolve(src,"api"),
      $drawerItems : path.resolve(src,"navigation","drawerItems"),
      $database : path.resolve(src,"database"),
      $getLoginProps : path.resolve(src,"auth","getLoginProps"),
      $logoComponent : path.resolve(src,"logo"),
      $assets : path.resolve(dir,"assets"),
      $layouts : path.resolve(src,"layouts"),
      $mainScreens : path.resolve(src,"screens","mainScreens"),
      $apiCustom : path.resolve(src,"api","apiCustom"),
      $signIn2SignOut : path.resolve(src,"auth","signIn2SignOut")
    }
    return require(`${require("@fto-consult/expo-ui/expo-ui-path")("babel.config")}`)(api,{base :dir,alias});
  };