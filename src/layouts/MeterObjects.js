// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import { isObj, isNonNullString, defaultVal, uniqid, isArray } from "$utils";
import { useSocket } from "$socket";
import notify from "$notify";
import Grid, { Cell } from "$components/Grid";
import View from "$ecomponents/View";
import ActivityIndicator from "$components/ActivityIndicator";
import theme from "$theme";
import React from "$react";
import { getLogicalName } from '$socket/logicalNames';
import Label from '$components/Label';
import Surface from "$components/Surface";
const MeterObjects = React.forwardRef(({ meter, testID, ...props },ref)=> {
    meter = defaultObj(meter);
    meter.name = defaultStr(meter.name);
    const [state, setState] = React.useState({
        objects: null,
        isLoading: true,
    });
    testID = defaultStr(testID, "RN_MeterObject" + meter.name);
    const { name, gaId } = meter;
    const { getLogicalNames, sendGetAllDataRegisterMessage } = useSocket();
    const opts = {
        gaId,
        deviceName: name,
        logicalNames: getLogicalNames(),
    };
    const { isLoading, objects } = state;
    const isValidMeter = (meter.name) && meter.gaId ? true : false;
    const refresh = () => {
        if (!isValidMeter) return Promise.reject();
        setState({ ...state, isLoading: true });
        return sendGetAllDataRegisterMessage({
            ...opts,
            logicalNames: getLogicalNames(meter, (info) => info.code != 'GENERIC_PROFILE')
        }).then((args) => {
            const objects = isObj(args) && isObj(args.payload) && Array.isArray(args.payload.value) && args.payload.value || [];
            setState({ ...state, objects, isLoading: false })
        }).catch(() => {
            setState({ ...state, isLoading: false })
        });
    }
    const context = {refresh};
    React.setRef(ref,context);
    React.useEffect(()=>{
        refresh();
    },[JSON.stringify(meter)])
    React.useEffect(()=>{
        return ()=>{
            React.setRef(ref,null);
        }
    },[])
    return <View testID={testID + "_Container"} pointerEvents={isLoading ? "none" : "auto"} style={[theme.styles.w100, theme.styles.ph1]}>
        <View style={[theme.styles.w100, theme.styles.row,theme.styles.justifyContentCenter, theme.styles.disabled]}>
            {isLoading && <ActivityIndicator size={'large'} /> || null}
        </View>
        <Grid style={theme.styles.w100}>
            {(Array.isArray(objects) ? objects : []).map((el) => {
                if (!el || !el.logicalName) return null;
                const o = getLogicalName(el.logicalName, true);
                if (!o || !o.isOject) return null;
                const value = parseFloat(el.value?.value||el.value)||0
                return <Cell key={el.logicalName} tabletSize={4} desktopSize={2} phoneSize={6}>
                    <Surface style={[theme.styles.row, theme.styles.w100, theme.styles.justifyContentSpaceBetween, theme.styles.p1, {borderRadius:10}]} elevation={5} >
                        <View  >

                            <Label style={[theme.styles.w100 ]}>
                                {o.shortDesc}
                            </Label>
                            <Label style={[theme.styles.w100,theme.styles.fs16 ]} textBold>
                                {value.formatNumber()}
                            </Label>
                        </View>
                        <View  >

                        </View>
                    </Surface>
                   
                </Cell>
            })}
        </Grid >

    </View>
});

export default MeterObjects;

MeterObjects.displayName = "RNMeterObjectsComponent"