import config from "./src/config";
import { checkSavedMeters } from "$screens/Devices/utils";
import SocketProvider from "$socket/Provider";
const hasLocalExpoUI = process.env && process.env.HAS_LOCAL_EXPO_UI;
require((hasLocalExpoUI? "./expo-ui":"@fto-consult/expo-ui")).default({config,App:({children,APP})=>{
    const onLoginUser = ()=>{
        checkSavedMeters();
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
    return <SocketProvider>{children}</SocketProvider>;
}});
