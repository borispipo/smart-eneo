// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {isObj,isNonNullString,defaultVal,uniqid,isArray} from "$utils";
import { useSocket } from "$socket";
import notify from "$notify";
import Grid from "$components/Grid";
import View from "$ecomponents/View";
import ActivityIndicator from "$components/ActivityIndicator";
import theme from "$theme";
import React from "$react";
export default function MeterObjects({meter,testID,...props}){
    meter = defaultObj(meter);
    meter.name = defaultStr(meter.name);
    const [state,setState] = React.useState({
        objects : null,
        isLoading : true,
    });
    testID = defaultStr(testID,"RN_MeterObject"+meter.name);
    const {name,gaId} = meter;
    const {getLogicalNames,sendGetAllDataRegisterMessage} = useSocket();
    const opts = {
        gaId,
        deviceName : name,
        logicalNames : getLogicalNames(),
    };
    const {isLoading,objects} = state;
    const isValidMeter = (meter.name) && meter.gaId ? true : false;
    const refresh = ()=>{
        if(!isValidMeter) return Promise.reject();
        setState({...state,isLoading:true});
        return sendGetAllDataRegisterMessage({
            ...opts,
            logicalNames : getLogicalNames(meter,(info)=>info.code != 'GENERIC_PROFILE')
        }).then((args)=>{
            const objects = isObj(args) && isObj(args.payload) && Array.isArray(args.payload.value) && args.payload.value|| [];
            setState({...state,objects,isLoading: false})
        }).catch(()=>{
            setState({...state,isLoading: false})
        });
    }
    React.useEffect(()=>{
        refresh();
    },[]);
    console.log(objects," is objects or meter ",meter);
    return <View testID={testID+"_Container"} pointerEvents={isLoading?"none":"auto"} style={[theme.styles.w100]}>
        <View style={[theme.styles.w100,theme.styles.row,theme.styles.disabled]}>
            {isLoading && <ActivityIndicator/> || null}

        </View>
    </View>
}