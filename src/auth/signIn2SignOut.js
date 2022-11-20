// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {put} from "$capi";
import "$utils";

export default {
    upsertUser : ({user})=>{
        return put('auth/user/{0}'.sprintf(user.id),{
            headers : {
                "Content-Type" : "multipart/form-data"
            },
            body : Object.toFormData({
                preferences : {
                    avatar : undefined,
                    theme  : user.theme,
                }
            })
        });
    }
}