
import React from "$react";
import PropTypes from "prop-types";
import Button,{setIsLoading} from "$ecomponents/Button";
import { useSocket } from "$socket";
import Icon from "$ecomponents/Icon";
import Link from "$ecomponents/Link";
import { LOAD_CURVE } from "../routes";
import { iconSize,meterIcon } from "./utils";
import {useDrawer} from "$ecomponents/Drawer";
import theme from "$theme";

export default function MeterItemContainer (props){
    const {meter} = props;
    const [state,setState] = React.useState({
        online : false,
    });
    const {name,gaId} = meter;
    const buttonRef = React.useRef(null);
    const {sendPingMessage,getLogicalNames} = useSocket();
    
    const opts = {
        gaId,
        deviceName : name,
    };
    const checkPing = ()=>{
        return sendPingMessage(opts).then((r)=>{
            const {hasError,data,payload} = r;
            if(!hasError && state.online === false){
                setState({...state,online:true});
            } else if(hasError && state.online ===true){
                setState({...state,online:false});
            }
            setIsLoading(buttonRef,false);
        });
    }
    
    React.useEffect(()=>{
        checkPing();
    },[]);
    const d = useDrawer();
    const color = state.online?theme.colors.success:theme.colors.error;
    return <Link routeName={LOAD_CURVE}  timeout = {500} routeParams={{meter,withMeterObjects:true}}
        Component = {Button}
        title={state.online?"":"Le compteur "+meter.meterName+" est hors ligne"} style={{color:color,marginLeft:5}} 
        onPress={(e)=>{
            if(d && d.close){
                d.close();
            }
            checkPing(e);
        }}
        ref = {buttonRef}
        upserCase = {false}
        left = {(p)=><Icon noPadding noMargin {...p} size={iconSize} icon={meterIcon}/>}
        iconProps = {{padding:0,margin:0}}
        right = {<Icon noPadding noMargin size={iconSize} color={color} icon={state.online? 'check' :'alert-circle'}/>}
        contentProps = {{style:{justifyContent:'flex-start',paddingVertical:0,paddingTop:0,paddingHorizontal:5}}}
    >
        {meter.meterName} : {meter.meterVoltage} V
    </Link>
}

MeterItemContainer.propTypes = {
    meter : PropTypes.shape({
        name : PropTypes.string,
        meterVoltage : PropTypes.number,
        _id : PropTypes.string.isRequired,
        meterName : PropTypes.string,
    }).isRequired
}
