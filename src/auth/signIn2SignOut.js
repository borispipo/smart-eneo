// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {put} from "$capi";
import "$utils";

export default {
    upsertUser : ({user})=>{
        console.log(user," is upserted heeeee");
        return put('auth/user/{0}'.sprintf(user.id),{
            body : {
                preferences : {
                    avatar : undefined,
                    theme  : user.theme,
                }
            }
        }).then((data)=>{
            console.log(data," is update preferences heeeee");
        })
    }
}