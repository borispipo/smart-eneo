
import {isValidUrl,defaultStr,isPromise,isNonNullString,isBlob,uniqid,defaultVal,defaultDecimal,removeQueryString,setQueryParams} from "$utils";
import {isJSON,parseJSON} from "$utils/json";
import {getToken,getLoggedUserId} from "$cauth/utils";
import DateLib from "$date";
import TYPES from "./types";
import LOGICAL_NAMES from "./logicalNames";
import { io} from "./client";
import APP from "$app/instance";
import {timeout} from "$capi";
import {canCheckOnline} from "$api";
import settings from "./settings";
import fetch from "$capi/fetch";
import Preloader from "$preloader";
import FileSystem from "$efile-system";

import Auth from "$cauth";

export * from "./session";
export {settings};

export * from "./logicalNames";

export * from "./types";

export const DEFAULT_TIMEOUT = 500;

export const MESSAGES = {};

const SOCKET_URL = defaultStr(process.env.SOCKET_HOST).trim("/").rtrim("/");

export const AUTHENTICATION_ERROR = "authentication error";

export const USER_ALREADY_CONNECTED = "this user is already connected";

export const DEFAULT_START_PERIOD = DateLib.parse("10/01/2017 00:00:00",DateLib.defaultDateTimeFormat);
export const DEFAULT_END_PERIOD = DateLib.parse("16/01/2017 00:00:00",DateLib.defaultDateTimeFormat);
export const buildURL = (url,queryParams)=>{
    const token = getToken();
    queryParams= Object.assign({},queryParams);
    const user = Auth.getLoggedUser();
    if(user && user.id){
        if(token){
            queryParams.token = token;
        }
         queryParams.userId = user.id;
    }
    queryParams.type = "client_app";
    return {url:removeQueryString(url),queryParams};
}
export const MANAGER = {};

const autoReconnectRef = {
    current : true
}
///pour l'afficahge des activities message
export const activityMessageRef = {
    current : false,
}
export function connect (url,options){
    options = defaultObj(options);
    let {events,onOpen,onClose,onSignedOut,onMessage,onDisconnect,onError,protocol,queryParams,...rest} = options;
    const {queryParams : query} = buildURL(url,queryParams) ;
    if(!query.token) return null;
    autoReconnectRef.current = true;
    const socket = io(SOCKET_URL, {
        auth: {
          token: query.token,
        },
        //autoConnect : true,
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
        if(activityMessageRef.current){
            activityMessageRef.current = false;
            Preloader.close();
        }
        if(autoReconnectRef.current){
            socket.connect();
        }
        if(typeof onDisconnect ==='function'){
            onDisconnect();
        }
        console.log("disconnected");
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
    socket.on("ACTIVITY_MESSAGE",(data)=>{
        if(!activityMessageRef.current) return;
        let type = undefined,message = undefined;
        if(isJSON(data)){
            data = parseJSON(data);
        }
        if(isObj(data)){
            type = defaultStr(data.type);
            message = defaultStr(data.payload,data.message);
        }
        if(!isNonNullString(message)){
            message = data;
        }
        if(!isNonNullString(type)){
            type = undefined;
        }
        if(isNonNullString(message)){
            Preloader.open({content:message,title:type});
        }
    });
    socket.isConnected = typeof socket.isConnected =='function'? socket.isConnected : ()=>socket.connected || !socket.disconnected;
    setTimeout(()=>{
        if(!socket.isConnected()){
            try {
                socket.connect();
            } catch{}
        }
    },500);
    socket.id = uniqid("socket-connection-id");
    MANAGER[socket.id] = socket;
    return socket;
}
export const ACTIVITY_MESSAGE_TOGGLE_TIMEOUT = 200;
/***
 * @param {boolean} la nouvelle valeur de l'activitymessageref
 * @param {number|function|boolean} si nombre, il s'agit du timeout, délai d'attente avecn modification de la valeur toggle
 *      si fonction alors il s'agit de la fonction de rappel qui sera appelée après modification de la valeur
 *      si boolean alors ça determinera si le preloader sera fermé où non a condition que toggle est à false;
*/
export const toggleActivityMessage = (toggle,timeout,cb)=>{
    const closePreloader = typeof timeout =='boolean'? timeout : typeof cb =='boolean'? cb : false;
    if(typeof timeout =='function'){
        const t = cb;
        cb = timeout;
        timeout = t;
    }
    setTimeout(()=>{
        activityMessageRef.current = typeof toggle =='boolean'? toggle : activityMessageRef.current;
        setTimeout(()=>{
            if(typeof cb =='function'){
                cb();
            }
            if(toggle === false && closePreloader === true){
                Preloader.close();
            }
        },100);
    },typeof timeout =='number' ? timeout : ACTIVITY_MESSAGE_TOGGLE_TIMEOUT)
    return activityMessageRef.current;
}
const _disconnect = (socket,id)=>{
    autoReconnectRef.current = false;
    try {
        socket.disconnect();
    } catch (e){
        console.log("disconnecting socket ",socket);
    }
    delete MANAGER[id];
}
export const disconnect = (id)=>{
    autoReconnectRef.current = false;
    if(id && typeof id =='string' && MANAGER[id]){
        return _disconnect(MANAGER[id],id);
    }
    Object.map(MANAGER,(socket,id)=>{
        _disconnect(socket,id);
    });
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
    //console.log(options," is opppp14",settings.getBAMode(defaultStr(options.deviceName,options.payload.deviceName)));
    /*** par défaut les données sont recherchés en backend */
    options.payload.mode = defaultStr(options.payload.mode,options.mode,settings.getBAMode(defaultStr(options.deviceName,options.payload.deviceName)));
    if(!options.payload.mode){
        delete options.payload.mode;
    }
    return options;
}
/**** envoie un message via le webSocket 
 * si la props multiple est  à true alors il s'agit d'un message destinée pour plusierus logicalNames, et la 
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
    if((options.checkOnline !== false || canCheckOnline) && !APP.isOnline()){
        return APP.checkOnline().then(cb);
    }
    return cb();
}

export const mutatePeriodOptions = (options)=>{
    let dateStart = defaultVal(options.payload.dateStart,options.dateStart,DEFAULT_START_PERIOD);
    let dateEnd = defaultVal(options.payload.dateEnd,options.dateEnd,DEFAULT_END_PERIOD);
    if(DateLib.isDateObj(dateStart)){
        dateStart = dateStart.toFormat(REQUEST_DATE_TIME_FORMAT);
    }
    if(DateLib.isDateObj(dateEnd)){
        dateEnd = dateEnd.toFormat(REQUEST_DATE_TIME_FORMAT);
    }
    options.payload.dateStart = dateStart;
    options.payload.dateEnd = dateEnd;
    delete options.payload.logicalNames;
    delete options.logicalNames;
    delete options.dateStart;
    delete options.dateEnd;
    return options;
}

export const REQUEST_DATE_TIME_FORMAT = "dd/mm/yyyy HH:MM:ss";
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
    mutatePeriodOptions(options);
    options.payload.logicalName = LOGICAL_NAMES.LOAD_CURVE_LOGICAL_NAME.code;
    options.type = TYPES.LOAD_CURVE_TYPE;
    return sendMessage(socket,options,false);
}

export const sendBilanMessage = (socket,opts)=>{
    const options = getSendMessageOptions(opts);
    if(!options) {
        return Promise.reject({
            msg : "could not send bilan message, invalid options",
        })
    }
    mutatePeriodOptions(options);
    ["deviceName","guruxAppId"].map((v)=>{
        delete options[v];
    })
    delete options.payload.logicalName;
    delete options.logicalName;
    options.type = TYPES.GET_BILAN;
    options.payload.logicalName = "0.0.99.1.0.255";
    delete options.payload.deviceName;
    delete options.payload.guruxAppId;
    return sendMessage(socket,options,false);
}

///envoie du message GetAllDataRegister
export const sendGetAllDataRegisterMessage = (socket,opts)=>{
    const options = getSendMessageOptions(opts);
    options.type = TYPES.GET_ALL_DATA_REGISTER;
    return sendMessage(socket,options,false);
}

/***envoie d'une requête ping au niveau du serveur de socket */
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

/**** retourne les logicalNames associés au compteur meter passé en paramètre
 * @param {object} meter, l'objet compteur sur lequel on veut récupérer les logicalNames
 * @param {function} filter, function de filtre permettant de filtrer les logicalsNames à récupérer
 */
export const getLogicalNames = (meter,filter)=>{
    if(!isObj(meter)) return "";
    const names = [];
    filter = typeof filter =='function'? filter : x=>true;
    Object.map(meter.objets,(info)=>{
        if(!isObj(info) || !isNonNullString(info.code) || !filter(info))return;
        names.push(info.code)
    });
    return names.join(",");
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


/*** télécharge la courve des charges dont le nom de la feuille est passé en paramètre depuis le serveur 
 * @param {string} sheetName le nom de la feuille excel associée à la courbe des charges à télécharger
 * @param {object} fetchOptions les options supplémentaires à passer à la fonction fetch téléchargeant la courbe des charges
 * @return {Promise} resolue lorsque la courbe des charges est téléchargée
*/
export const downloadLoadCurve = (sheetName,fetchOptions)=>{
    if(!isNonNullString(sheetName)){
        return Promise.reject({message:'Nom de la fuille excel associée à la courbe des charges mal définie. Veuillez spécifier un nom valide'});
    }
    let {fileName,...rest} = defaultObj(fetchOptions)
    fileName = defaultStr(fileName,sheetName);
    return new Promise((resolve,reject)=>{
        Preloader.open("téléchargement de la courbe des charges [{0}]...".sprintf(sheetName));
        rest.headers = defaultObj(rest.headers);
        //rest.headers["Content-Type"] = "application/octet-stream";
        fetch("sheet/{0}".sprintf(sheetName),rest).then((res)=>{
            return res.text().then((base64)=>{
                FileSystem.writeExcel({content:base64,fileName}).then(resolve);
                Preloader.close();
            })
        }).catch((e)=>{
            reject(e);
            Preloader.close();
        })
    })
}

