import React from "$react";
import APP from "$app/instance";
import {isNonNullString,isPromise,isObj,uniqid,defaultStr,defaultNumber,isValidUrl} from "$utils";
import { connect as nCreateSocket,sendPingMessage as sPingMessage,sendMessage as sMessage,sendLoadCurveMessage as sLoadCurveMessage,sendGetAllDataRegisterMessage as sGetAllDataRegisterMessage,sendBilanMessage as sBilanMessage,getLogicalName,REQUEST_DATE_TIME_FORMAT,getLogicalNames} from "./utils";
import TYPES from "./types";
import LOGICAL_NAMES  from "./logicalNames";
import Queue from "$utils/queue";
import PropTypes from "prop-types";
import Auth from "$cauth";
import {timeout} from "$capi/utils";

const queue = new Queue();

export const SocketContext = React.createContext(null);

export function useSocket(){
    return React.useContext(SocketContext);
}


export default function SocketProvider(props){
    const {children,url,options} = props;
    const socketRef = React.useRef(null);
    const context = React.useRef({}).current;
    const callbackRef = React.useRef(null);
    const BINDED_ELTS = React.useRef({}).current;
    const hasSocket = context.hasSocket = x=> {
        if(!socketRef.current){
            return false;
        }
        return true;
    }
    
    const canSendMessage = context.isOpen = context.canSendMessage = (checkIsConnected)=> {
        if(!hasSocket()) return false;
        return socketRef.current.connected || !socketRef.current.disconnected  ? true : false;
    }
    
    context.isClosed = x => !context.isOpen();
    
   
    /*** permet d'enregistrer un écouter de messages reçus 
     * @param {string}, l'id de l'écoute
     * @param {object|function}, les options à écouter. si c'est une fonction alors elle prendra la valeur callback
     *   si options est un object, il est de la forme : 
     *    options : {
     *      callback, la fonction de rappel lorsqu'on a un message
        *      type : le type de message que l'on veut écouter
        *      types : {array|object}, les types de messages que l'on veut écouter
        *      filter : (args)=> permet de filter les messages qui viennent
        *      count : {number}, le nombre de fois que le message sera écouté. si count vaut 5 par exemple, lorsque le message sera écouté 5 fois alors la fonction unbind sera appelée
        *      
        * }
    */
    const bind = (id,options)=>{
        if(!isNonNullString(id)){
            return;
        }
        if(typeof options =='function'){
            options = {callback:options}; 
        }
        defaultObj(options)
        options.type = defaultStr(options.type).trim().toUpperCase();
        options.instanceId = uniqid("instance-id");
        options.id = id;
        options.maxErrorsCount = typeof options.maxErrorsCount =='number'?options.maxErrorsCount : 1;
        BINDED_ELTS[id] = options;
        return options;
    }
    const unbind = (id)=>{
        if(!isNonNullString(id)) return;
        delete BINDED_ELTS[id];
    }
    const getSocket = ()=>{
        return socketRef.current;
    }

    const socketOptions = React.useMemo(()=>{
        const sOptions = Object.assign({},options);
        return {
            ...sOptions,
            onOpen : (args)=>{
                queue.stop=false;
                if(typeof sOptions.onOpen ==='function'){
                    sOptions.onOpen(args);
                }
                context.status = "opened";
                context.open = true;
                context.closed = false;
                if(typeof callbackRef.current =='function'){
                    callbackRef.current(args);
                }
                callbackRef.current = undefined;
            },
            onClose : (args)=>{
                queue.stop=true;
                if(typeof sOptions.onClose ==='function'){
                    sOptions.onClose(args);
                }
                context.status = 'closed';
                context.closed = true;
                context.open = false;
            },
            onError : (e)=>{
                queue.stop=true;
                console.log(e," has error in provider")
                if(typeof sOptions.onError ==='function'){
                    sOptions.onError(args);
                }
                context.hasError = true;
                context.error = e;
            },
            onSignedOut : ()=>{
                Auth.signOut2Redirect();
            }
        }
    },[options])
    const connect = ()=>{
        if(hasSocket()) return;
        socketRef.current = nCreateSocket(url,socketOptions);
        return socketRef.current;
    }
    const sendMessage = (options,method)=>{
        method = typeof method =="function"? method : sMessage;
        if(hasSocket() && !canSendMessage()){
			return timeout(new Promise((resolve,reject)=>{
                callbackRef.current = x =>{
                    const t = method(socketRef.current,options);
                    if(isPromise(t)){
                        t.then(resolve).catch(reject);
                    }
                    callbackRef.current = null;
                }
            }));
		}
        return timeout(method(socketRef.current,options));
    };
    const sendLoadCurveMessage = (options)=>{
        return sendMessage(options,sLoadCurveMessage);
    }
    const sendBilanMessage = (options)=>{
        return sendMessage(options,sBilanMessage);
    }
    const sendPingMessage = (options)=>{
        return sendMessage(options,sPingMessage);
    }
    const sendGetAllDataRegisterMessage = (options)=>{
        return sendMessage(options,sGetAllDataRegisterMessage);
    }
    React.useEffect(()=>{       
        const onLoginUser = (u)=>{
            connect(url,socketOptions);
        };
        const onGoOnline = ()=>{
            //connect(url,socketOptions);
        }
        const onGoOffline = ()=>{
        }
        APP.on(APP.EVENTS.GO_ONLINE,onGoOnline);
        APP.on(APP.EVENTS.GO_OFFLINE,onGoOffline);
        APP.on(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
        connect();
        return ()=>{
            APP.off(APP.EVENTS.GO_ONLINE,onGoOnline);
            APP.off(APP.EVENTS.GO_OFFLINE,onGoOffline);
            APP.off(APP.EVENTS.AUTH_LOGIN_USER,onLoginUser);
        }
    },[])
    const value = {connect,...context,REQUEST_DATE_TIME_FORMAT,getLogicalName,getLogicalNames,sendPingMessage,sendMessage,sendLoadCurveMessage,sendBilanMessage,canSendMessage,context,bind,unbind,TYPES,LOGICAL_NAMES,getSocket,get:getSocket,sendGetAllDataRegisterMessage};
    return <SocketContext.Provider value={value}>
        {children}
    </SocketContext.Provider>
}

/**** le socket est le composant permettant de faire des requêtes périodiques au serveur de socket
 * 
 * 
 */
const SocketContainer = React.forwardRef((props,ref)=>{
    let {sendMessage:sendSocketMessage,Component,autoRun,loadCurve,filter,id,options,onMessage,children} = props;
    const socket = useSocket();
    const isMounted = React.useIsMounted();
    const {TYPES,sendLoadCurveMessage,getLogicalNames,bind,unbind} = socket;
    const [state,setState] = React.useState({
        online : false,data : null,payload: null,ready : false,hasError : false,
    })
    id = React.useRef(defaultStr(id,uniqid("socket-container-msgid"))).current;
    const optionsRef = React.useRef({});
    const opts = {
        type : TYPES.GET_DATA,
        ...defaultObj(options),
    };
    const reconnect = ()=>{
        optionsRef.current = {};
        let sockedMsgResult = {};
        if(typeof sendSocketMessage =='function'){
            sockedMsgResult = sendSocketMessage({...socket,options:opts})
        } else if(loadCurve){
            const opts1 = typeof options =='function'? options({...socket,options:opts}) : opts;
            sockedMsgResult = sendLoadCurveMessage(opts1);
        }
        if(!sockedMsgResult) return null;
        optionsRef.current = sockedMsgResult;
        return sockedMsgResult;
    }
    const context = {run:reconnect}
    React.useEffect(()=>{
        bind(id,{
            callback : (args)=>{
                let {hasError,data,payload} = args;
                if(!isMounted()){
                    return;
                }
                payload = data?.payload||payload;
                const online = args.online = !hasError && state.online === false? true : hasError && state.online ===true ? false : state.online;
                args.setState = ()=> {
                    return setState({...state,ready:true,hasError,data,payload,online});
                }
                if(typeof onMessage ==='function' && onMessage(args) === false) return;
                setState({...state,data,ready:true,hasError,payload,online});
            },
            filter : (args)=>{
                if(args.messageId !== optionsRef.current.messageId){
                    return false;
                }
                if(typeof filter =='function' && filter(args) === false) return false;
                return true;
            }
        });
        if(autoRun !== false){
            reconnect();
        }
        return ()=>{
            unbind(id);
            React.setRef(ref,null);
        }
    },[]);
    React.setRef(ref,{context});
    const c = typeof children =='function'? children({socket,context,...state}) : React.isComponent(Component) ? <Component {...state} /> : children;
    return React.isValidElement(c)? c : null;
});

SocketContainer.displayName = "SocketContainerComponent";

SocketContainer.propTypes = {
    onMessage : PropTypes.func,//la fonction de rappel appelée lorsqu'un message est reçue, si retourne false, alors le status online du container ne sera pas modifié via la foncition setState
    sendMessage : PropTypes.func,//la fonction par défaut permettant d'envoyer un message, prend en paramètre l'objet socket obtenue vie la routine useSocket et la props options, contenant les options par défaut à passer à la fonction sendMessage
    id : PropTypes.string, //l'unique id du container,
    children : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
        PropTypes.elementType,
    ]),
    /*** objet où fonction permettant de récupérer les options à passer au container */
    options : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
    loadCurve : PropTypes.bool,//si la coube des charges est chargé par d'afaut
    autoRun : PropTypes.bool,//si l'envoie de message se fera de manière automatique lorsque la page sera monté
}

export {SocketContainer,SocketContainer as Container};