// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {getSessionKey as getAuthSessionKey} from "$cauth/utils/session";
import {defaultObj,isObj,extendObj,isNonNullString,defaultStr} from "$utils";
import session from "$session";

/***@param {string} meterName */
export const getKey = (meterName)=>{
    const m = getMeterName(meterName);
    return getAuthSessionKey("socket{0}".sprintf(m?("-"+m):""));
}

/**@PARAM {string} key
 * @param {string} meterName le nom du compteur
 */
export const get = (key,meterName)=>{
    const data = defaultObj(session.get(getKey(meterName)));
    if(isNonNullString(key)) {
        return data[key];
    }
    return data;
}

export const getMeterName = meter => isObj(meter)? defaultStr(meter.name) : defaultStr(meter);

export const set = (key,value,meterName)=>{
    meterName = isObj(key) && value && getMeterName(value) || getMeterName(meterName);
    const data = get(undefined,meterName);
    let sKey = getKey(meterName);
    if(isObj(key)){
        return session.set(sKey,extendObj({},data,key));
    }
    data[key] = value;
    return session.set(sKey,data);
}


export default {
    get,set,getKey,getMeterName
}