import config from "./src/config";
import { checkSavedMeters } from "$screens/Devices/utils";

require(process.env.IS_LOCAL_DEV?"./expo-ui":"@fto-consult/expo-ui").default({config,App:({children,APP})=>{
    const SocketProvider = require("$socket/Provider").default;
    const onLoginUser = ()=>{
        checkSavedMeters();
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
    return <SocketProvider>{children}</SocketProvider>;
}});