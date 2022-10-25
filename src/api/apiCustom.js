// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {isObj,defaultObj} from "$utils";
export default {
    getFetcherOptions : (options)=>{
        if(isObj(options.body)){
            options.body = JSON.stringify(options.body);
            options.headers = defaultObj(options.headers);
            options.headers["Content-Type"] = "application/json"; 
        }
        return options;
    }
}