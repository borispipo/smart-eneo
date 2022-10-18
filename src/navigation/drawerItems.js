// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import APP from "$app";
import { screenName as aboutScreenName} from "$screens/Help/About";
import MertersContainer from "$screens/Devices/TreeView";
import i18n from "$i18n";
import theme from "$theme";

export default function drawerItems(){
    const name = APP.getName();
    const metersListProps = {style:[theme.styles.w100]};
    return [
        {
            title: i18n.lang("meters"),
            label : (props)=>{return <MertersContainer {...props}/>},
            contentContainerProps : metersListProps ,
            contentProps : metersListProps,
            labelProps : metersListProps,
            onPress : false,
        },
        {
            divider : true,
        },
        {
            key : 'dataHelp',
            label : 'Aide',
            section : true,
            divider : false,
            items : [
                {
                    icon : 'help',
                    label : 'A propos de '+name,
                    routeName : aboutScreenName,
                }
            ]
        }
    ]
}