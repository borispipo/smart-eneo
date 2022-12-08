// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {getSessionKey as getAuthSessionKey} from "$cauth/utils/session";
import {defaultObj,isObj,extendObj,isNonNullString} from "$utils";
import session from "$session";

export const getKey = ()=>{
    return getAuthSessionKey("socket");
}

export const get = (key)=>{
    const data = defaultObj(session.get(getKey()));
    if(isNonNullString(key)) return data[key];
    return data;
}

export const set = (key,value)=>{
    const data = get();
    const sKey = getKey();
    if(isObj(key)){
        return session.set(sKey,extendObj({},data,key));
    }
    data[key] = value;
    return session.set(sKey,data);
}


export default {
    get,set,getKey,
}