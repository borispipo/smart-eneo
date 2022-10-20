import config from "./src/config";
import { checkSavedMeters } from "$screens/Devices/utils";
import SocketProvider from "$socket/Provider";
const ePath = require("./expo-ui-build-path");
require(ePath.includes("@fto-consult")?"@fto-consult/expo-ui":"./expo-ui").default({config,App:({children,APP})=>{
    const onLoginUser = ()=>{
        checkSavedMeters();
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
    return <SocketProvider>{children}</SocketProvider>;
}});