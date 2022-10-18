module.exports = async function(env, argv) {
    const path = require("path");
    const base = path.resolve(__dirname);
    return require(require("./expo-ui-path")()+"/webpack.config")(env,argv,{base});
};