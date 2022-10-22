// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$ecomponents/Label";
import View from "$ecomponents/View";
import theme from "$theme";
import Avatar from "$ecomponents/Avatar";
export default {
    Text : function({styles,style,testID,...rest}){
        return <View testID={testID} style={style}>
                <Label style={styles.medium}>Smart</Label>
                <Label style={styles.large}>E</Label>
                <Label style={styles.small}>N</Label>
                <Label style={styles.medium}>EO</Label>
        </View> 
    },
    Image : function(){
        return <Avatar
            size = {50}
            icon = "lightning-bolt"
            style = {{margin:0,padding:0}}
            containerProps = {{style:{margin:0,padding:0}}}
            color = {theme.colors.primary}
        />
    }
}
