import config from "./src/config";
import { checkSavedMeters } from "$screens/Devices/utils";
import SocketProvider from "$socket/Provider";
import registerApp from "$expo-ui-root-path";
registerApp({config,App:({children,APP})=>{
    const onLoginUser = ()=>{
        checkSavedMeters();
    }
    APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
    return <SocketProvider>{children}</SocketProvider>;
}});
/*      ............*/