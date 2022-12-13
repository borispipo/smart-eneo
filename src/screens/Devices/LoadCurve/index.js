// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import Screen from "$screen";
import React from "$react";
import { LOAD_CURVE  as screenName} from "../routes";
import {getScreenProps} from "$cnavigation";
import LoadCurveLayout from "$layouts/LoadCurve";
import {defaultObj,isNonNullString} from "$utils";
import MeterObjects from "$layouts/MeterObjects";
import theme from "$theme";

export default function LoadCurveScreen(p){
    const {meter:cMeter,...props} = getScreenProps(p);
    const meter = defaultObj(cMeter)
    const ref = React.useRef(null);
    const meterObJectRef = React.useRef(null);
    return <Screen
        withScrollView
        {...props}
        title = {"Courbe des charges "+(isNonNullString(meter.name) ?(" ["+meter.name+"]"):"")}
        appBarProps = {{
            actions :[{
                icon : 'refresh',
                onPress : ()=>{
                    ref.current && ref.current.refresh && ref.current.refresh();
                },
                text : 'Actualiser'
            }]
        }}
    >
        <MeterObjects
            meter={meter}
            ref = {meterObJectRef}
        />
        <LoadCurveLayout
            {...props}
            ref = {ref}
            meter = {meter}
            periodSelectorProps = {{
                ...defaultObj(props.periodSelectorProps),
                extendActions : [
                    ...Object.toArray(defaultObj(props.periodSelectorProps).extendActions),
                    meter.name && {
                        icon : "file-refresh",
                        backgroundColor : theme.Colors.get("green-500"),
                        color : theme.Colors.getContrast(theme.Colors.get("green-500")),
                        text : 'Actualiser les objets [{0}]'.sprintf(meter.name),
                        onPress : ()=>{
                            if(!meterObJectRef.current || !meterObJectRef.current.refresh) return;
                            meterObJectRef.current.refresh();
                        }
                    }
                ]
            }}
        />
    </Screen>
}

LoadCurveScreen.displayName = "LoadCurveScreen";
LoadCurveScreen.screenName = screenName;
LoadCurveScreen.authRequired = true;