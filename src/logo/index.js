// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import Label from "$components/Label";
import View from "$components/View";
export default function LogoComponent({styles,style,testID,...rest}){
    return <View testID={testID} style={style}>
            <Label style={styles.medium}>Smart</Label>
            <Label style={styles.large}>E</Label>
            <Label style={styles.small}>N</Label>
            <Label style={styles.medium}>EO</Label>
    </View> 
}