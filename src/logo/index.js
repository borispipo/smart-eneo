// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import Image from "$components/Image";
import logo from "$assets/logo.png";

export default {
    Text : function({styles,style,testID,...rest}){
        return <View testID={testID} style={style}>
                <Label style={styles.medium}>Smart</Label>
                <Label style={styles.large}>E</Label>
                <Label style={styles.small}>E</Label>
                <Label style={styles.medium}>M</Label>
        </View> 
    },
    Image : function(){
        return <Image
            size = {60}
            src = {logo}
            containerProps = {{style:{margin:0,padding:0}}}
        />
    }
}
