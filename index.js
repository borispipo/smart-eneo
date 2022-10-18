import App from "./expo-ui";
import config from "./src/config";
import { checkSavedMeters } from "$screens/Devices/utils";

App({config,App:({children,APP})=>{
    const SocketProvider = require("$socket/Provider").default;
    const onLoginUser = ()=>{
        checkSavedMeters();
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
    return <SocketProvider>{children}</SocketProvider>;
}});