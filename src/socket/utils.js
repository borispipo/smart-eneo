
import {isValidUrl,defaultStr,isNonNullString,uniqid,defaultVal,defaultDecimal,removeQueryString,setQueryParams} from "$utils";
import {isJSON,parseJSON} from "$utils/json";
import {getToken,isValidToken,getLoggedUserId} from "$cauth/utils";
import DateLib from "$date";
import TYPES from "./types";
import LOGICAL_NAMES from "./logicalNames";
import { io} from "./client";
import APP from "$app/instance";
import {timeout} from "$capi";

import Auth from "$cauth";

export * from "./logicalNames";

export * from "./types";

export const DEFAULT_TIMEOUT = 500;

export const MESSAGES = {};

const SOCKET_URL = defaultStr(process.env.SOCKET_HOST).trim("/").rtrim("/");

export const AUTHENTICATION_ERROR = "authentication error";

export const USER_ALREADY_CONNECTED = "this user is already connected";

export const BACKEND_MODE = "BA";

export const LOAD_CURVE_DEFAULT_START_PERIOD = DateLib.parse("10/01/2017 00:00:00",DateLib.defaultDateTimeFormat);
export const LOAD_CURVE_DEFAULT_END_PERIOD = DateLib.parse("16/01/2017 00:00:00",DateLib.defaultDateTimeFormat);
export const buildURL = (url,queryParams)=>{
    const token = getToken();
    queryParams= Object.assign({},queryParams);
    const user = Auth.getLoggedUser();
    if(user && user.id){
        if(isValidToken(token)){
            queryParams.token = token.token;
         }
         queryParams.userId = user.id;
    }
    queryParams.type = "client_app";
    return {url:removeQueryString(url),queryParams};
}
export const MANAGER = {};

export function connect (url,options){
    options = defaultObj(options);
    let {events,onOpen,onClose,onSignedOut,onMessage,onDisconnect,onError,protocol,queryParams,...rest} = options;
    const {queryParams : query} = buildURL(url,queryParams) ;
    const params = JSON.stringify(query);
    const socket = io(SOCKET_URL, {
        auth: {
          token: query.token,
        },
        query
    });
    socket.on("connect", (args) => {
        if(onOpen){
            onOpen(args);
        }
        const engine = socket.io.engine;
        engine.on("close", (reason) => {
            if(onClose){
                onClose(reason);
            }
        });
    });
    socket.on("disconnect", () => {
        socket.connect();
        if(typeof onDisconnect ==='function'){
            onDisconnect();
        }
    });
    socket.on("connect_error", (error) => {
        const errorStr = error && error.message ? defaultStr(error.message).toLowerCase() : undefined
        if(errorStr ===USER_ALREADY_CONNECTED) return;
        //console.log(error.message," is error messag ehedd");
        if(errorStr == AUTHENTICATION_ERROR){
            if(onSignedOut){
                return onSignedOut(error);
            }
        }
        if(onError){
            onError(error);
        }
    });
    socket.isConnected = typeof socket.isConnected =='function'? socket.isConnected : ()=>socket.connected || !socket.disconnected;
    return socket;
}

export const getSendMessageOptions = (opts) =>{
    if(isNonNullString(opts)){
        opts = {type:opts};
    }
    opts = defaultObj(opts);
    opts.type = defaultStr(opts.type).trim().toUpperCase();
    let {type,gaId,guruxAppId,logicalName,logicalNames,deviceName,multiple,...options} = opts;
    options = Object.assign({},options);
    options.messageId = defaultStr(options.messageId,uniqid("socket-msg-"));
    options.type = type;
    options.payload = Object.assign({},options.payload);
    options.payload.userId = defaultStr(options.payload.userId,getLoggedUserId());
    options.guruxAppId = options.payload.guruxAppId = defaultStr(options.payload.guruxAppId,gaId,guruxAppId);
    options.deviceName = options.payload.deviceName = defaultStr(options.payload.deviceName,deviceName);
    logicalName = defaultStr(logicalName,options.payload.logicalName);
    logicalNames = defaultStr(logicalNames,options.payload.logicalNames);
    if(logicalNames.toLowerCase().contains(",")){
        multiple = true;
    } else if(logicalName.contains(',')){
        logicalNames = logicalName;
        multiple = true;
    }
    /*** en cas de multiple, le type est getAllDataRegister */
    if(multiple){
        options.type = TYPES.GET_ALL_DATA_REGISTER;
        options.payload.logicalNames = logicalNames || logicalName;
    } else {
        options.payload.logicalName = logicalName;
    }
    /*** par défaut les données sont recherchés en backend */
    options.payload.mode = defaultStr(options.payload.mode,options.mode,BACKEND_MODE);
    return options;
}
/**** envoie un message via le webSocket 
 *  si la props multiple est  à true alors il s'agit d'un message destinée pour plusierus logicalNames, et la 
 * valeur logicalName dans ce cas est l'ensemble des logicialNames séparés par la virgule
 * @return {Promise}
*/
export const sendMessage = (socket,opts,prepareOptions)=>{
    if(!socket || !socket.send) {
        console.log(socket," is not defined, could not send message ");
        return Promise.reject({
            socket,
            msg : " socket is not defined, could not send message ",
        });
    }
    const options = prepareOptions !== false ? getSendMessageOptions(opts) : defaultObj(opts);
    if(!options || !isNonNullString(options.type)) return Promise.reject({msg:'options non valides',options});
    const cb = ()=>{
        const type = options.type;
        const p = new Promise((resolve,reject)=>{
            socket.emit(type,options,function(response){
                const args = Array.prototype.slice.call(arguments,0);
                response = isJSON(response)? parseJSON(response) : defaultObj(response);
                response.data = defaultObj(response.data);
                response.payload = defaultObj(response.data.payload,response.payload);
                response.deviceName = defaultStr(response.deviceName,response.payload.device,options.deviceName);
                response.type = defaultStr(response.type,type);
                if(response.error && response.error.isError){
                    response.hasError = true;
                    response.error.message = defaultStr(response.error.errorMessage,response.error.message);
                } else {
                    response.hasError = false;
                }
                const answer = {...response,arguments:args,options};
                if(typeof socket.sendMessageCallback ==='function'){
                    socket.sendMessageCallback(answer);
                }
                resolve(answer);
            });
        });
        return timeout(p,options.delay || options.timeout);
    };
    if((options.checkOnline !== false || process.env.CAN_RUN_API_OFFLINE !== true) && !APP.isOnline()){
        return APP.checkOnline().then(cb);
    }
    return cb();
}

export const LOAD_CURVE_DATE_TIME_FORMAT = "dd/mm/yyyy HH:MM:ss";
/*** envoie un message de récupération de la courbe des charges 
 * les options doivent avoir la date de début, dateStart et la date de fin dateEnd
*/
export const sendLoadCurveMessage = (socket,opts)=>{
    const options = getSendMessageOptions(opts);
    if(!options) {
        return Promise.reject({
            msg : "could not send load curve message, invalid options",
        })
    }
    options.payload.logicalName = LOGICAL_NAMES.LOAD_CURVE_LOGICAL_NAME.code;
    options.type = TYPES.LOAD_CURVE_TYPE;
    let dateStart = defaultVal(options.payload.dateStart,options.dateStart,LOAD_CURVE_DEFAULT_START_PERIOD);
    let dateEnd = defaultVal(options.payload.dateEnd,options.dateEnd,LOAD_CURVE_DEFAULT_END_PERIOD);
    if(DateLib.isDateObj(dateStart)){
        dateStart = dateStart.toFormat(LOAD_CURVE_DATE_TIME_FORMAT);
    }
    if(DateLib.isDateObj(dateEnd)){
        dateEnd = dateEnd.toFormat(LOAD_CURVE_DATE_TIME_FORMAT);
    }
    options.payload.dateStart = dateStart;
    options.payload.dateEnd = dateEnd;
    delete options.logicalNames;
    delete options.payload.logicalNames;
    delete options.dateStart;
    delete options.dateEnd;
    return sendMessage(socket,options,false);
}

export const sendPingMessage = (socket,opts)=>{
    const options = getSendMessageOptions(opts);
    if(!options){
        console.error(opts," is invalid options for sending ping")
        return Promise.reject({msg:'could not send ping message invalid options'});
    }
    options.type = TYPES.GET_PING;
    const deviceName = options.deviceName;
    delete options.logicalNames;
    delete options.payload.logicalNames;
    delete options.deviceName;
    options.payload.deviceNames = defaultStr(options.payload.deviceNames,options.devicesNames,deviceName);
    return sendMessage(socket,options,false);
}

export const createSocket = (url,options)=>{
    if(isObj(options)){
        let t = options;
        options = t;
        url = isValidUrl(t)? t : undefined;
    }
    options = defaultObj(options);
    return connect(url,options);
}


export const READY_STATES = {
    0 : 'CONNECTING',
    1 : 'OPEN',
    2 : 'CLOSING',
    3 : 'CLOSED'
}

export const getReadyStateMessage = (readyState)=>{
    if(isObj(readyState) && typeof readyState.readyState =='number'){
        readyState = readyState.readyState;
    }
    return typeof readyState =='number' && READY_STATES[readyState] || undefined;
}
