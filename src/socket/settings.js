// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import session from "./session";
export const BACKEND_MODE = "BA";
const bModeSessionKey = "BA-mode";
export const isBAMode = ()=>{
    const isB = session.get(bModeSessionKey);
    return isB === undefined ? true : isB ==='1' || isB && true || false;
}
export default {
    get isBAMode (){
        return isBAMode();
    },
    get mode (){
        return isBAMode()? BACKEND_MODE : undefined;
    },
    get toggleBAMode(){
        return ()=>{
            const isB = isBAMode()?"0":"1";
            session.set(bModeSessionKey,isB);
            return isB == "1" ? true : 0;
        }
    }
}