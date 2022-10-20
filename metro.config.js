const path = require("path");
const dir = path.resolve(__dirname);
require(`${require("@fto-consult/expo-ui/expo-ui-path")("metro.config.js")}`)({
  dir,
});