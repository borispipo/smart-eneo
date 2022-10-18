const path = require("path");
const dir = path.resolve(__dirname);
require(require("./expo-ui-path")()+"/expo.metro.config")({
  //nodeModulesPaths : [path.resolve(dir,"node_modules")],
  dir,
});