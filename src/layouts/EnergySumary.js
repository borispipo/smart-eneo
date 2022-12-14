// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import React from "$react";
import DateLib from "$date";
import { useSocket } from "$socket";
import { METER_TYPES } from "$database/data/devices";
import {isObj,defaultNumber,isNonNullString,defaultObj} from "$utils";
import Grid,{Cell} from "$ecomponents/Grid";
import View from "$ecomponents/View";
import theme from "$theme";
import Preloader from "$preloader";
import EnergySumaryItem from "./EnergySumaryItem";
import DateComponent from "$ecomponents/Date";
import Button from "$ecomponents/Button";
import notify from "$notify";
import { StyleSheet } from "react-native";
import Label from "$ecomponents/Label";
import Surface from "$components/Surface";
import Divider from "$components/Divider";
import { meterIcon } from "$screens/Devices/TreeView/utils";
import { ScrollView } from "react-native";
import LoadCurve from "./LoadCurve";
import { getMetersListFromType } from "$database/data/devices";

export default function EnergySumaryLayout({...props}){
    const defaultStartPariod = DateLib.getFirstDayOfMonth();
    const startDateRef = React.useRef(defaultStartPariod);
    const endDateRef = React.useRef(new Date());
    const meterRef = React.useRef(null);
    const [state,setState] = React.useState({
        energies : [],
        isLoading : true,
    });
    const {sendBilanMessage,toggleActivityMessage} = useSocket();
    const values = {};
    const {energies:customEnergies} = state;
    const energies = Array.isArray(customEnergies)? customEnergies : [];
    const metersByTypes = {};
    energies.map((e)=>{
        if(!isObj(e) || !isNonNullString(e.device) || !isObj(e.payload) || !isObj(e.payload.value)) return;
        const type = e.device[0].toUpperCase();
        if(!METER_TYPES[type]){
            return;
        }
        metersByTypes[type] = defaultObj(metersByTypes[type]);
        metersByTypes[type][e.device] = e.payload.value;
        values[type] = defaultObj(values[type]);
        Object.map(e.payload.value,(v,i)=>{
            if(typeof v !='number') return;
            values[type][i] = defaultNumber(values[type][i]);
            values[type][i]+= v;
        })
        
    });
    const refreshBilan = ()=>{
        Preloader.open("R??cup??ration des donn??es...");
        const type = Object.keys(METER_TYPES)[0];
        toggleActivityMessage(true);
        Promise.all([
            new Promise((resolve)=>{
                if(!meterRef.current){
                    getMetersListFromType(METER_TYPES[type]).then((m)=>{
                        m.map((_)=>{
                            if(isObj(_) && _.name =="A_80_LOCBABA"){
                                meterRef.current = _;
                                return;
                            }
                        });
                        if(!meterRef.current){
                            meterRef.current = m[0];
                        }
                    }).finally(()=>{
                        resolve(meterRef.current);
                    })
                } else {
                    resolve(meterRef.current);
                }
            }),
            new Promise((resolve,reject)=>{
                sendBilanMessage({
                    dateStart : startDateRef.current,
                    dateEnd : endDateRef.current,
                }).then(({payload:{value}})=>{
                    resolve({energies:Array.isArray(value)? value : []})
                }).catch((e)=>{
                    notify.error(e);
                    resolve({});
                })
            })
        ]).then(([meter,state])=>{
            setState({...state,isLoading:false})
        }).finally(()=>{
            Preloader.close();
            toggleActivityMessage(false,true);
        })
    }
    React.useEffect(()=>{
        setTimeout(refreshBilan,1000);
    },[]);
    
    
    const testID = "RN_EnergySumarryScreen";
    return <View style={[theme.styles.w100,theme.styles.ph1]} testID={testID}>
        <View>
            <Grid testID={testID+"_Grid"}>
                {Object.mapToArray(METER_TYPES,(type,t)=>{
                    return <Cell key={t} tabletSize={6} style={[{maxHeight:'100%'}]} desktopSize={4} phoneSize={12} smallPhoneSize={12}>
                        <EnergySumaryItem
                            data = {values[t]}
                            meterType = {type}
                        />
                    </Cell>
                })}
            </Grid>
        </View>
        <Grid>
            <Cell tabletSize={12} desktopSize={8} phoneSize={12}>
                <Surface>
                    <LoadCurve
                        editActionProps={{
                            text : "Modifier la p??riode"
                        }}
                        refreshActionProps={{
                            text : "Actualiser"
                        }}
                        meter = {meterRef.current}
                        startDate = {startDateRef.current}
                        endDate = {endDateRef.current}
                        withPeriodSelector = {true}
                        periodSelectorProps = {{meter:null}}
                        onRefreshPeriod = {({startDate,endDate})=>{
                            startDateRef.current = startDate;
                            endDateRef.current = endDate;
                            refreshBilan();
                            return false;
                        }}
                    />
                </Surface>
            </Cell>
            <Cell tabletSize={6} desktopSize={4} phoneSize={12}>
                <Surface elevation={10} style={[theme.styles.p1,theme.styles.mt0,theme.styles.w100,theme.styles.mv1]} >
                    <Label textBold style={[theme.styles.w100,theme.styles.fs18,theme.styles.pv05,{textAlign:'center'}]}>
                        Classement Consommation
                    </Label>
                    <ScrollView vertical testID={testID+"_ScrollView"}>
                        {Object.mapToArray(METER_TYPES,(type,code)=>{
                            const tId = testID+"_MeterByTypes_"+code;
                            return <View style={[theme.styles.w100]} key={code} testID={tId}>
                                <Button color={type.color} upperCase={false} contentStyle={[theme.styles.justifyContentFlexStart]} icon={type.icon} testID={tId+"_Label"} style={[theme.styles.w100]}>
                                    {type.label}
                                </Button>
                                <Divider style={[theme.styles.w100]}/>
                                <View style={[theme.styles.w100,theme.styles.ph05]}>
                                    {Object.mapToArray(metersByTypes[code],(values,meter)=>{
                                        const canal = "canal"+(type.incoming ? "1" : type.outgoing ? "2" : "3"); 
                                        const value = defaultNumber(values[canal]);
                                        return <React.Fragment key={code+meter}>
                                            <View style={[theme.styles.flexWrap,theme.styles.row,theme.styles.w100,theme.styles.justifyContentSpaceBetween]}>
                                                <Button key={code+meter} color={theme.colors.text} style={[theme.styles.w100]} iconBefore={true} icon={meterIcon} contentStyle={[theme.styles.justifyContentFlexStart]}>
                                                    {meter}
                                                </Button>
                                                <Label style={[theme.styles.pl05]} textBold primary>{value.formatNumber()+" kwh"}</Label>
                                            </View>
                                            <Divider style={[theme.styles.w100]}/>
                                        </React.Fragment>
                                    })}
                                </View>
                            </View>
                        })}
                    </ScrollView>
                </Surface>
            </Cell>
        </Grid>
    </View>;
}
const styles = StyleSheet.create({
    date : {
        width : 140,
    }
});
