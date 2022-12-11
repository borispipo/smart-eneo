// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import session from "./session";
export const BACKEND_MODE = "BA";
const bModeSessionKey = "BA-mode";

export const isBAMode = (meter)=>{
    const isB = session.get(bModeSessionKey,meter);
    return isB !== false ? true : false;
}
export const toggleBAMode = (meter)=>{
    const isB = isBAMode() ? false : true;
    session.set(bModeSessionKey,isB,meter);
    return isB;
}
export const getBAMode = (meter)=>{
    return isBAMode(meter)?BACKEND_MODE : undefined;
}
export default {
    get isBAMode (){
        return isBAMode;
    },
    get toggleBAMode(){
        return toggleBAMode;
    },
    get getBAMode(){
        return getBAMode;
    }
}